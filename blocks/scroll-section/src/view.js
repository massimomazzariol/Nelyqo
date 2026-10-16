import './horizontal.scss';

const HORIZONTAL_SELECTOR =
	'.wp-block-nelyqo-scroll-section.is-mode-horizontal-track';
const SECTION_BREAKPOINT = 960;
const HORIZONTAL_STAGE_MIN_HEIGHT = 360;
const HORIZONTAL_STAGE_VIEWPORT_GUTTER = 12;
const HORIZONTAL_STAGE_VIEWPORT_RATIO = 0.58;
// The track moves as far as the page scrolls (1:1, like a normal scroll turned sideways); very long
// tracks go a little faster so the pinned stretch does not get tedious.
const HORIZONTAL_SCROLL_RANGE_FACTOR = 1;
const HORIZONTAL_SCROLL_RANGE_FACTOR_FLOOR = 0.8;
const HORIZONTAL_SCROLL_RANGE_DECAY = 0.08;
const HORIZONTAL_SCROLL_RANGE_MIN_VIEWPORT_FACTOR = 0.14;
const HORIZONTAL_PROGRESS_LEAD_FACTOR = 0.14;
const HORIZONTAL_PROGRESS_LEAD_MAX = 120;

const MOTION_PRESETS = {
	subtle: {
		shift: 18,
		scaleFloor: 0.982,
		opacityFloor: 0.88,
		saturateFloor: 0.92,
	},
	medium: {
		shift: 28,
		scaleFloor: 0.965,
		opacityFloor: 0.78,
		saturateFloor: 0.84,
	},
	strong: {
		shift: 40,
		scaleFloor: 0.94,
		opacityFloor: 0.66,
		saturateFloor: 0.76,
	},
};

const clamp = ( value, min, max ) => Math.min( max, Math.max( min, value ) );

const getLayout = ( section ) =>
	section.querySelector( ':scope > .nelyqo-scroll-section__layout' );

const getDirectCards = ( container ) =>
	Array.from(
		container?.querySelectorAll(
			':scope > .wp-block-nelyqo-scroll-card'
		) || []
	);

const getMotionPreset = ( section ) => {
	if ( section.classList.contains( 'is-motion-subtle' ) ) {
		return MOTION_PRESETS.subtle;
	}

	if ( section.classList.contains( 'is-motion-strong' ) ) {
		return MOTION_PRESETS.strong;
	}

	return MOTION_PRESETS.medium;
};

const getStickyOffset = ( section ) => {
	const stickyOffset = parseFloat(
		window
			.getComputedStyle( section )
			.getPropertyValue( '--nelyqo-scroll-sticky-offset' )
	);

	return Number.isFinite( stickyOffset ) ? stickyOffset : 32;
};

const getNumericCustomProperty = ( element, propertyName, fallback = 0 ) => {
	const value = parseFloat(
		window.getComputedStyle( element ).getPropertyValue( propertyName )
	);

	return Number.isFinite( value ) ? value : fallback;
};

const setCardVisuals = (
	card,
	{ offsetX = 0, offsetY = 0, scale = 1, opacity = 1, saturate = 1 }
) => {
	card.style.setProperty(
		'--nelyqo-scroll-card-offset-x',
		`${ offsetX.toFixed( 2 ) }px`
	);
	card.style.setProperty(
		'--nelyqo-scroll-card-offset-y',
		`${ offsetY.toFixed( 2 ) }px`
	);
	card.style.setProperty( '--nelyqo-scroll-card-scale', scale.toFixed( 4 ) );
	card.style.setProperty(
		'--nelyqo-scroll-card-opacity',
		opacity.toFixed( 4 )
	);
	card.style.setProperty(
		'--nelyqo-scroll-card-saturate',
		saturate.toFixed( 4 )
	);
};

const updateCardClasses = ( cards, activeIndex ) => {
	cards.forEach( ( card, index ) => {
		card.classList.toggle( 'is-active', index === activeIndex );
		card.classList.toggle( 'is-before-active', index < activeIndex );
		card.classList.toggle( 'is-after-active', index > activeIndex );
	} );
};

const unwrapLegacyHorizontalStage = ( layout ) => {
	const stage = layout.querySelector(
		':scope > .nelyqo-scroll-section__horizontal-stage'
	);

	if ( ! stage ) {
		return;
	}

	const intro = stage.querySelector(
		':scope > .nelyqo-scroll-section__intro'
	);
	const shell = stage.querySelector(
		':scope > .nelyqo-scroll-section__horizontal-shell'
	);

	if ( intro ) {
		layout.prepend( intro );
	}

	if ( shell ) {
		layout.append( shell );
	}

	stage.remove();
};

const ensureHorizontalStructure = ( sectionState ) => {
	const { element } = sectionState;
	const layout = getLayout( element );

	if ( ! layout ) {
		return false;
	}

	unwrapLegacyHorizontalStage( layout );

	const intro = layout.querySelector(
		':scope > .nelyqo-scroll-section__intro'
	);

	if ( ! intro ) {
		element.classList.remove( 'is-horizontal-enhanced' );
		return false;
	}

	let shell = layout.querySelector(
		':scope > .nelyqo-scroll-section__horizontal-shell'
	);
	let track = shell?.querySelector(
		':scope > .nelyqo-scroll-section__horizontal-track'
	);

	if ( ! shell ) {
		shell = document.createElement( 'div' );
		shell.className = 'nelyqo-scroll-section__horizontal-shell';

		track = document.createElement( 'div' );
		track.className = 'nelyqo-scroll-section__horizontal-track';
		shell.appendChild( track );
		intro.after( shell );
	} else if ( ! track ) {
		track = document.createElement( 'div' );
		track.className = 'nelyqo-scroll-section__horizontal-track';
		shell.appendChild( track );
	}

	if ( intro.nextElementSibling !== shell ) {
		intro.after( shell );
	}

	getDirectCards( layout ).forEach( ( card ) => {
		track.appendChild( card );
	} );

	const cards = getDirectCards( track );

	sectionState.layout = layout;
	sectionState.intro = intro;
	sectionState.shell = shell;
	sectionState.track = track;
	sectionState.cards = cards;
	sectionState.stickyOffset = getStickyOffset( element );

	if ( ! cards.length ) {
		element.classList.remove( 'is-horizontal-enhanced' );
		return false;
	}

	// The track scrolls sideways on its own when it is not pinned: keyboard users need to reach it.
	shell.tabIndex = 0;
	element.classList.add( 'is-horizontal-enhanced' );

	return true;
};

const setHorizontalPinnedState = ( sectionState, shouldPin ) => {
	const { element, shell } = sectionState;
	const wasPinned = sectionState.shouldPin;

	sectionState.shouldPin = shouldPin;
	element.classList.toggle( 'is-horizontal-pinned', shouldPin );

	if ( ! shouldPin ) {
		element.style.removeProperty(
			'--nelyqo-scroll-horizontal-stage-height'
		);
		element.style.removeProperty(
			'--nelyqo-scroll-horizontal-section-height'
		);
		element.style.setProperty(
			'--nelyqo-scroll-horizontal-track-offset',
			'0px'
		);

		if ( wasPinned && shell ) {
			shell.scrollLeft = 0;
		}

		return;
	}

	element.style.setProperty(
		'--nelyqo-scroll-horizontal-stage-height',
		`${ sectionState.stageHeight }px`
	);
	element.style.setProperty(
		'--nelyqo-scroll-horizontal-section-height',
		`${ Math.ceil(
			sectionState.stageHeight + sectionState.scrollRange
		) }px`
	);

	if ( ! wasPinned && shell ) {
		shell.scrollLeft = 0;
	}
};

const updateHorizontalSectionState = ( sectionState, reducedMotionQuery ) => {
	if ( ! ensureHorizontalStructure( sectionState ) ) {
		return;
	}

	const { element, intro, shell, track, cards } = sectionState;
	const desktop = window.innerWidth >= SECTION_BREAKPOINT;
	const reducedMotion = reducedMotionQuery.matches;
	const viewportHeight = window.innerHeight || 1;
	const shellGutter = getNumericCustomProperty(
		element,
		'--nelyqo-scroll-horizontal-shell-gutter'
	);
	const maxDistance = Math.max(
		track.scrollWidth - shell.clientWidth - shellGutter,
		0
	);
	const distanceRatio =
		shell.clientWidth > 0 ? maxDistance / shell.clientWidth : 0;
	const scrollRangeFactor = clamp(
		HORIZONTAL_SCROLL_RANGE_FACTOR -
			Math.max( 0, distanceRatio - 1 ) * HORIZONTAL_SCROLL_RANGE_DECAY,
		HORIZONTAL_SCROLL_RANGE_FACTOR_FLOOR,
		HORIZONTAL_SCROLL_RANGE_FACTOR
	);
	const contentHeight = Math.max(
		intro?.offsetHeight || 0,
		shell.offsetHeight || 0,
		track.offsetHeight || 0,
		...cards.map( ( card ) => card.offsetHeight || 0 )
	);

	sectionState.stickyOffset = getStickyOffset( element );
	sectionState.maxDistance = maxDistance;
	sectionState.scrollRange = Math.ceil(
		Math.max(
			maxDistance * scrollRangeFactor,
			maxDistance > 0
				? shell.clientWidth *
						HORIZONTAL_SCROLL_RANGE_MIN_VIEWPORT_FACTOR
				: 0
		)
	);
	sectionState.stageHeight = Math.ceil(
		Math.max(
			HORIZONTAL_STAGE_MIN_HEIGHT,
			contentHeight,
			Math.min(
				viewportHeight * HORIZONTAL_STAGE_VIEWPORT_RATIO,
				viewportHeight -
					sectionState.stickyOffset -
					HORIZONTAL_STAGE_VIEWPORT_GUTTER
			)
		)
	);
	// The stage pins in the middle of the screen, never closer to the top than the sticky offset.
	sectionState.stickyOffset = Math.max(
		sectionState.stickyOffset,
		Math.round( ( viewportHeight - sectionState.stageHeight ) / 2 )
	);
	element.style.setProperty(
		'--nelyqo-scroll-horizontal-pin-top',
		`${ sectionState.stickyOffset }px`
	);

	const shouldPin =
		desktop &&
		! reducedMotion &&
		element.classList.contains( 'has-sticky' ) &&
		maxDistance > 1;

	setHorizontalPinnedState( sectionState, shouldPin );

	let trackOffset = 0;

	if ( shouldPin && maxDistance > 0 ) {
		const rect = element.getBoundingClientRect();
		const scrollRange = Math.max( sectionState.scrollRange, 1 );
		const progressLead = Math.min(
			sectionState.stageHeight * HORIZONTAL_PROGRESS_LEAD_FACTOR,
			shell.clientWidth * HORIZONTAL_PROGRESS_LEAD_FACTOR,
			HORIZONTAL_PROGRESS_LEAD_MAX
		);
		const progress = clamp(
			( sectionState.stickyOffset + progressLead - rect.top ) /
				scrollRange,
			0,
			1
		);

		trackOffset = -progress * maxDistance;
	}

	element.style.setProperty(
		'--nelyqo-scroll-horizontal-track-offset',
		`${ trackOffset.toFixed( 2 ) }px`
	);

	if ( ! cards.length ) {
		return;
	}

	const motionEnabled = element.classList.contains( 'has-motion' );
	const emphasisDisabled = element.classList.contains(
		'has-no-card-emphasis'
	);
	const preset = getMotionPreset( element );
	const shellRect = shell.getBoundingClientRect();
	const focusLine =
		shellRect.left + shellRect.width * ( desktop ? 0.46 : 0.5 );
	const effectiveTrackShift = shouldPin ? trackOffset : -shell.scrollLeft;
	let activeIndex = 0;
	let smallestDistance = Number.POSITIVE_INFINITY;

	element.classList.toggle(
		'is-motion-ready',
		motionEnabled && ! reducedMotion
	);

	cards.forEach( ( card, index ) => {
		const cardWidth =
			card.offsetWidth || card.getBoundingClientRect().width;
		const cardLeft = shellRect.left + card.offsetLeft + effectiveTrackShift;
		const cardRight = cardLeft + cardWidth;
		const cardCenter = cardLeft + cardWidth / 2;
		const rawDistance = shellRect.width
			? ( cardCenter - focusLine ) / shellRect.width
			: 0;
		const clampedDistance = clamp( rawDistance, -1.15, 1.15 );
		const proximity = clamp( 1 - Math.abs( rawDistance ) * 1.45, 0, 1 );
		const allowDecorativeMotion = motionEnabled && ! reducedMotion;
		const offsetY = allowDecorativeMotion
			? clampedDistance * ( preset.shift * 0.2 )
			: 0;
		const scale =
			allowDecorativeMotion && ! emphasisDisabled
				? preset.scaleFloor + proximity * ( 1 - preset.scaleFloor )
				: 1;
		const opacity =
			allowDecorativeMotion && ! emphasisDisabled
				? preset.opacityFloor + proximity * ( 1 - preset.opacityFloor )
				: 1;
		const saturate =
			allowDecorativeMotion && ! emphasisDisabled
				? preset.saturateFloor +
				  proximity * ( 1 - preset.saturateFloor )
				: 1;

		if ( Math.abs( rawDistance ) < smallestDistance ) {
			smallestDistance = Math.abs( rawDistance );
			activeIndex = index;
		}

		setCardVisuals( card, {
			offsetY,
			scale,
			opacity,
			saturate,
		} );
		card.classList.toggle(
			'is-in-view',
			cardRight > shellRect.left && cardLeft < shellRect.right
		);
	} );

	sectionState.activeIndex = activeIndex;
	updateCardClasses( cards, activeIndex );
};

const observeReducedMotion = ( reducedMotionQuery, callback ) => {
	if ( typeof reducedMotionQuery.addEventListener === 'function' ) {
		reducedMotionQuery.addEventListener( 'change', callback );
		return;
	}

	if ( typeof reducedMotionQuery.addListener === 'function' ) {
		reducedMotionQuery.addListener( callback );
	}
};

const initHorizontalSections = ( reducedMotionQuery ) => {
	const sections = Array.from(
		document.querySelectorAll( HORIZONTAL_SELECTOR )
	)
		.map( ( element ) => ( {
			element,
			layout: getLayout( element ),
			intro: null,
			shell: null,
			track: null,
			cards: [],
			activeIndex: -1,
			shouldPin: false,
			stageHeight: 0,
			maxDistance: 0,
			scrollRange: 0,
			stickyOffset: getStickyOffset( element ),
		} ) )
		.filter( ( sectionState ) => sectionState.layout );

	if ( ! sections.length ) {
		return;
	}

	let animationFrame = null;
	const visibleSections = new Set();

	const requestUpdate = () => {
		if ( animationFrame !== null ) {
			return;
		}

		animationFrame = window.requestAnimationFrame( () => {
			animationFrame = null;

			sections.forEach( ( sectionState ) => {
				if (
					visibleSections.size &&
					! visibleSections.has( sectionState.element )
				) {
					return;
				}

				updateHorizontalSectionState(
					sectionState,
					reducedMotionQuery
				);
			} );
		} );
	};

	const visibilityObserver = new window.IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					visibleSections.add( entry.target );
					return;
				}

				visibleSections.delete( entry.target );
			} );

			requestUpdate();
		},
		{
			rootMargin: '24% 0px 24% 0px',
			threshold: [ 0, 0.1, 0.25, 0.5, 0.75, 1 ],
		}
	);

	const resizeObserver =
		'ResizeObserver' in window
			? new window.ResizeObserver( requestUpdate )
			: null;

	sections.forEach( ( sectionState ) => {
		visibilityObserver.observe( sectionState.element );

		if ( ! ensureHorizontalStructure( sectionState ) ) {
			return;
		}

		sectionState.shell.addEventListener( 'scroll', requestUpdate, {
			passive: true,
		} );

		[
			sectionState.intro,
			sectionState.shell,
			sectionState.track,
			...sectionState.cards,
		]
			.filter( Boolean )
			.forEach( ( node ) => resizeObserver?.observe( node ) );
	} );

	window.addEventListener( 'scroll', requestUpdate, { passive: true } );
	window.addEventListener( 'resize', requestUpdate );
	window.addEventListener( 'load', requestUpdate );
	observeReducedMotion( reducedMotionQuery, requestUpdate );

	if ( document.fonts?.ready ) {
		document.fonts.ready.then( requestUpdate ).catch( () => {} );
	}

	requestUpdate();
};

const initScrollSections = () => {
	const reducedMotionQuery = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	);

	initHorizontalSections( reducedMotionQuery );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initScrollSections );
} else {
	initScrollSections();
}
