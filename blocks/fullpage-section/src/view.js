const SECTION_SELECTOR = '.wp-block-nelyqo-fullpage-section.is-height-viewport';
const SEQUENCE_CLASS = 'nelyqo-fullpage-section__sequence';
const TRACK_CLASS = 'nelyqo-fullpage-section__track';
const PANEL_CLASS = 'nelyqo-fullpage-section__panel';
const READY_CLASS = 'is-nelyqo-fullpage-ready';
const ACTIVE_PANEL_CLASS = 'is-active';
const HAS_SECTIONS_CLASS = 'has-nelyqo-fullpage-sections';
const PROPERTY_HEADER_OFFSET = '--nelyqo-fullpage-measured-header-offset';
const PROPERTY_HEADER_STACK_INDEX = '--nelyqo-fullpage-header-stack-index';
const PROPERTY_VIEWPORT_HEIGHT = '--nelyqo-fullpage-viewport-height';
const PROPERTY_ACTIVE_OFFSET = '--nelyqo-fullpage-active-offset';
const PROPERTY_PANEL_COUNT = '--nelyqo-fullpage-panel-count';
const EDGE_TOLERANCE_PX = 1;
// How far (px) the slides may sit from the top of the screen and still count as filling it.
const DOCK_TOLERANCE_PX = 2;
// Scrolling towards the slides docks them once they are this close (share of the screen height).
const DOCK_REACH_RATIO = 0.5;
const TRANSITION_SETTLE_BUFFER_MS = 50;
const WHEEL_DELTA_THRESHOLD_RATIO = 0.1;
// A wheel gesture ends after this pause; trackpad inertia sends events every ~16 ms.
const WHEEL_GESTURE_GAP_MS = 220;
// Within a gesture, a delta this much larger than the previous one is a fresh push, not inertia.
const WHEEL_NEW_PUSH_RATIO = 1.3;
const WHEEL_DELTA_MODE_LINE = 1;
const WHEEL_DELTA_MODE_PAGE = 2;
const SWIPE_DISTANCE_RATIO = 0.14;
const SWIPE_AXIS_DOMINANCE = 1.18;
const HEADER_SELECTOR = [
	// The theme's sticky overlay header: the bar inside it is not a direct child of the page.
	'.nelyqo-overlay-header',
	'.wp-site-blocks > header',
	'body > header',
	'header.wp-block-template-part',
	'.site-header',
	'#site-header',
	'#masthead',
].join( ', ' );

const instances = [];
let headerOffsetPx = 0;
let globalsBound = false;
let measureFrame = null;

const clamp = ( value, min, max ) => Math.min( Math.max( value, min ), max );

const getNow = () => window.performance?.now() || Date.now();

const isVisibleElement = ( element ) => {
	if ( ! element ) {
		return false;
	}

	const style = window.getComputedStyle( element );

	return style.display !== 'none' && style.visibility !== 'hidden';
};

const getVisibleTopObstructionHeight = ( element, baseOffset ) => {
	if ( ! isVisibleElement( element ) ) {
		return 0;
	}

	const rect = element.getBoundingClientRect();

	if (
		rect.height <= 0 ||
		rect.bottom <= baseOffset ||
		rect.top > baseOffset
	) {
		return 0;
	}

	return Math.max( 0, rect.bottom - baseOffset );
};

const getTopObstructionHeight = ( element, baseOffset ) => {
	if ( ! element ) {
		return 0;
	}

	return [ element, ...element.querySelectorAll( '*' ) ].reduce(
		( height, node ) =>
			Math.max(
				height,
				getVisibleTopObstructionHeight( node, baseOffset )
			),
		0
	);
};

const getViewportHeight = () =>
	window.visualViewport?.height ||
	window.innerHeight ||
	document.documentElement.clientHeight ||
	0;

const updateHeaderOffset = () => {
	const adminBarHeight = getTopObstructionHeight(
		document.getElementById( 'wpadminbar' ),
		0
	);
	const headerHeight = getTopObstructionHeight(
		document.querySelector( HEADER_SELECTOR ),
		adminBarHeight
	);
	const offset = Math.max( 0, Math.round( adminBarHeight + headerHeight ) );

	document.documentElement.style.setProperty(
		PROPERTY_HEADER_OFFSET,
		`${ offset }px`
	);

	document.documentElement.style.setProperty(
		PROPERTY_HEADER_STACK_INDEX,
		String( instances.length + 1 )
	);

	headerOffsetPx = offset;
	return offset;
};

const parseTimeValue = ( value ) => {
	const trimmedValue = value.trim();
	const parsedValue = Number.parseFloat( trimmedValue );

	if ( ! Number.isFinite( parsedValue ) ) {
		return 0;
	}

	if ( trimmedValue.endsWith( 'ms' ) ) {
		return parsedValue;
	}

	if ( trimmedValue.endsWith( 's' ) ) {
		return parsedValue * 1000;
	}

	return 0;
};

const getLongestTransitionMs = ( element ) => {
	const style = window.getComputedStyle( element );
	const durations = style.transitionDuration
		.split( ',' )
		.map( parseTimeValue );
	const delays = style.transitionDelay.split( ',' ).map( parseTimeValue );

	return durations.reduce( ( longestTransition, duration, index ) => {
		const delay = delays[ index ] ?? delays[ delays.length - 1 ] ?? 0;

		return Math.max( longestTransition, duration + delay );
	}, 0 );
};

const waitForTransformTransition = ( element, callback ) => {
	const transitionDuration = getLongestTransitionMs( element );

	if ( transitionDuration <= 0 ) {
		callback();
		return;
	}

	let isDone = false;
	let timeoutId = null;

	const finish = () => {
		if ( isDone ) {
			return;
		}

		isDone = true;
		window.clearTimeout( timeoutId );
		element.removeEventListener( 'transitionend', handleTransitionEnd );
		element.removeEventListener( 'transitioncancel', finish );
		callback();
	};

	function handleTransitionEnd( event ) {
		if ( event.target === element && event.propertyName === 'transform' ) {
			finish();
		}
	}

	element.addEventListener( 'transitionend', handleTransitionEnd );
	element.addEventListener( 'transitioncancel', finish );
	timeoutId = window.setTimeout(
		finish,
		transitionDuration + TRANSITION_SETTLE_BUFFER_MS
	);
};

const updatePanelStates = ( state ) => {
	state.panels.forEach( ( panel, index ) => {
		const isActive = index === state.activeIndex;

		panel.classList.toggle( ACTIVE_PANEL_CLASS, isActive );
		panel.setAttribute( 'aria-hidden', isActive ? 'false' : 'true' );
	} );
};

const setActiveIndex = ( state, nextIndex, options = {} ) => {
	const { force = false, immediate = false } = options;
	const clampedIndex = clamp( nextIndex, 0, state.panels.length - 1 );

	if ( ! force && clampedIndex === state.activeIndex ) {
		return false;
	}

	state.activeIndex = clampedIndex;
	state.sequence.style.setProperty(
		PROPERTY_ACTIVE_OFFSET,
		`${ -1 * clampedIndex * state.viewportHeight }px`
	);
	updatePanelStates( state );

	if (
		immediate ||
		state.reducedMotionQuery.matches ||
		state.panels.length < 2
	) {
		state.isAnimating = false;
		return true;
	}

	state.isAnimating = true;
	waitForTransformTransition( state.track, () => {
		state.isAnimating = false;
	} );

	return true;
};

const updateMeasurements = ( state, headerOffset ) => {
	const viewportHeight = Math.max(
		0,
		Math.round( getViewportHeight() - headerOffset )
	);

	state.viewportHeight = viewportHeight;
	state.sequence.style.setProperty(
		PROPERTY_VIEWPORT_HEIGHT,
		`${ viewportHeight }px`
	);
	state.sequence.style.setProperty(
		PROPERTY_PANEL_COUNT,
		String( state.panels.length )
	);
	state.panels.forEach( ( panel ) => {
		panel.style.setProperty(
			PROPERTY_VIEWPORT_HEIGHT,
			`${ viewportHeight }px`
		);
	} );

	setActiveIndex( state, state.activeIndex, {
		force: true,
		immediate: true,
	} );
};

const requestMeasurements = () => {
	if ( measureFrame !== null ) {
		return;
	}

	measureFrame = window.requestAnimationFrame( () => {
		measureFrame = null;

		const headerOffset = updateHeaderOffset();
		instances.forEach( ( state ) =>
			updateMeasurements( state, headerOffset )
		);
	} );
};

// Distance (px) between the top of the slides and the place where they fill the screen.
const getDockOffset = ( state ) =>
	state.sequence.getBoundingClientRect().top - headerOffsetPx;

// 0 when the slides fill the screen; 1 when they sit lower (reached scrolling down);
// -1 when they sit higher (reached scrolling back up).
const getDockDirection = ( state ) => {
	const offset = getDockOffset( state );

	if ( Math.abs( offset ) <= DOCK_TOLERANCE_PX ) {
		// Once docked, the way in no longer matters: moving off is leaving, not arriving.
		state.approachFrom = 0;
		return 0;
	}

	return offset > 0 ? 1 : -1;
};

// Brings the slides to fill the screen: from above on the first slide, from below on the last.
const dock = ( state, direction ) => {
	setActiveIndex( state, direction > 0 ? 0 : state.panels.length - 1, {
		force: true,
		immediate: true,
	} );
	window.scrollTo( {
		top:
			window.scrollY +
			state.sequence.getBoundingClientRect().top -
			headerOffsetPx,
		behavior: state.reducedMotionQuery.matches ? 'auto' : 'smooth',
	} );
};

// Slides only page while they fill the screen. Moving towards them (wheel, swipe or key) docks
// them once they are within reach (half the screen by default; a page key moves almost a whole
// screen, so it reaches a whole one); moving away from them is ordinary page scrolling. A long step
// can carry the page past the docking point on the way in: that still counts as arriving, so the
// slides dock back instead of being skipped. The way in is the side the slides were last seen
// entirely off screen (approachFrom); before that is known, the active slide stands in for it
// (the first one going down, the last going up).
const shouldDock = (
	state,
	direction,
	reach = state.viewportHeight * DOCK_REACH_RATIO
) => {
	const dockDirection = getDockDirection( state );
	const isNear = Math.abs( getDockOffset( state ) ) < reach;
	const cameFrom =
		state.approachFrom === null
			? state.activeIndex ===
			  ( direction > 0 ? 0 : state.panels.length - 1 )
			: state.approachFrom === direction;
	const isArrivingPast = dockDirection === -direction && cameFrom;

	return (
		dockDirection !== 0 &&
		isNear &&
		( dockDirection === direction || isArrivingPast )
	);
};

const canNavigate = ( state, direction ) => {
	if ( direction > 0 ) {
		return state.activeIndex < state.panels.length - 1;
	}

	return state.activeIndex > 0;
};

const canScrollPage = ( direction ) => {
	const scroller = document.scrollingElement || document.documentElement;

	if ( direction > 0 ) {
		return (
			scroller.scrollTop <
			scroller.scrollHeight - scroller.clientHeight - EDGE_TOLERANCE_PX
		);
	}

	return scroller.scrollTop > EDGE_TOLERANCE_PX;
};

const canScrollElement = ( element, direction ) => {
	const style = window.getComputedStyle( element );
	const overflowY = style.overflowY;
	const canOverflow =
		overflowY === 'auto' ||
		overflowY === 'scroll' ||
		overflowY === 'overlay';

	if (
		! canOverflow ||
		element.scrollHeight <= element.clientHeight + EDGE_TOLERANCE_PX
	) {
		return false;
	}

	if ( direction > 0 ) {
		return (
			element.scrollTop <
			element.scrollHeight - element.clientHeight - EDGE_TOLERANCE_PX
		);
	}

	return element.scrollTop > EDGE_TOLERANCE_PX;
};

const findScrollableAncestor = ( target, boundary, direction ) => {
	let element = target?.nodeType === 1 ? target : target?.parentElement;

	while ( element && element !== boundary.parentElement ) {
		if ( canScrollElement( element, direction ) ) {
			return element;
		}

		if ( element === boundary ) {
			break;
		}

		element = element.parentElement;
	}

	return null;
};

const getWheelDirection = ( event ) => {
	if ( Math.abs( event.deltaX ) > Math.abs( event.deltaY ) ) {
		return 0;
	}

	if ( event.deltaY > 0 ) {
		return 1;
	}

	if ( event.deltaY < 0 ) {
		return -1;
	}

	return 0;
};

const getNormalizedWheelDeltaY = ( event, state ) => {
	if ( event.deltaMode === WHEEL_DELTA_MODE_LINE ) {
		const lineHeight = Number.parseFloat(
			window.getComputedStyle( state.sequence ).lineHeight
		);

		return (
			event.deltaY * ( Number.isFinite( lineHeight ) ? lineHeight : 1 )
		);
	}

	if ( event.deltaMode === WHEEL_DELTA_MODE_PAGE ) {
		return event.deltaY * state.viewportHeight;
	}

	return event.deltaY;
};

const getWheelThreshold = ( state ) =>
	Math.max(
		EDGE_TOLERANCE_PX,
		state.viewportHeight * WHEEL_DELTA_THRESHOLD_RATIO
	);

const handleWheel = ( state, event ) => {
	if ( event.ctrlKey || state.panels.length < 2 ) {
		return;
	}

	const direction = getWheelDirection( event );

	// Tiny deltas are not ignored: they are the tail of trackpad inertia, and letting them
	// through would scroll the page a few pixels and undock the slides.
	if ( direction === 0 ) {
		return;
	}

	if ( findScrollableAncestor( event.target, state.sequence, direction ) ) {
		return;
	}

	// One gesture moves one slide at most. Trackpads keep sending decaying events (inertia) for
	// 2-3 s after the fingers stop; they belong to the same gesture. A pause, a change of direction
	// or a clearly stronger push starts a new one.
	const now = getNow();
	const strength = Math.abs( getNormalizedWheelDeltaY( event, state ) );
	const isNewGesture =
		now - state.wheelLastTime > WHEEL_GESTURE_GAP_MS ||
		direction !== state.wheelDirection ||
		strength > state.wheelLastStrength * WHEEL_NEW_PUSH_RATIO;

	state.wheelLastTime = now;
	state.wheelLastStrength = strength;

	if ( isNewGesture ) {
		state.wheelDirection = direction;
		state.wheelDistance = 0;
		state.wheelGestureUsed = false;
	}

	if ( state.isAnimating || state.wheelGestureUsed ) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	const dockDirection = getDockDirection( state );

	if ( dockDirection !== 0 && ! shouldDock( state, direction ) ) {
		return;
	}

	if ( dockDirection === 0 && ! canNavigate( state, direction ) ) {
		if ( ! canScrollPage( direction ) ) {
			event.preventDefault();
			event.stopPropagation();
		}
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	state.wheelDistance += strength;

	if ( state.wheelDistance < getWheelThreshold( state ) ) {
		return;
	}

	state.wheelGestureUsed = true;

	if ( dockDirection !== 0 ) {
		dock( state, direction );
		return;
	}

	setActiveIndex( state, state.activeIndex + direction );
};

const getSwipeThreshold = ( state ) =>
	Math.max( EDGE_TOLERANCE_PX, state.viewportHeight * SWIPE_DISTANCE_RATIO );

const handleTouchStart = ( state, event ) => {
	const touch = event.changedTouches[ 0 ];

	if ( ! touch ) {
		return;
	}

	state.touchStart = {
		x: touch.clientX,
		y: touch.clientY,
	};
};

const handleTouchMove = ( state, event ) => {
	if ( ! state.touchStart || state.panels.length < 2 ) {
		return;
	}

	const touch = event.changedTouches[ 0 ];

	if ( ! touch ) {
		return;
	}

	const deltaX = touch.clientX - state.touchStart.x;
	const deltaY = touch.clientY - state.touchStart.y;
	const direction = deltaY < 0 ? 1 : -1;
	const hasVerticalIntent =
		Math.abs( deltaY ) > Math.abs( deltaX ) * SWIPE_AXIS_DOMINANCE;

	if (
		hasVerticalIntent &&
		getDockDirection( state ) === 0 &&
		canNavigate( state, direction ) &&
		! findScrollableAncestor( event.target, state.sequence, direction )
	) {
		event.preventDefault();
	}
};

const handleTouchEnd = ( state, event ) => {
	const touchStart = state.touchStart;

	if ( ! touchStart || state.panels.length < 2 ) {
		state.touchStart = null;
		return;
	}

	const touch = event.changedTouches[ 0 ];
	state.touchStart = null;

	if ( ! touch || state.isAnimating ) {
		return;
	}

	const deltaX = touch.clientX - touchStart.x;
	const deltaY = touch.clientY - touchStart.y;
	const direction = deltaY < 0 ? 1 : -1;
	const isVerticalSwipe =
		Math.abs( deltaY ) >= getSwipeThreshold( state ) &&
		Math.abs( deltaY ) > Math.abs( deltaX ) * SWIPE_AXIS_DOMINANCE;

	if (
		! isVerticalSwipe ||
		findScrollableAncestor( event.target, state.sequence, direction )
	) {
		return;
	}

	if ( shouldDock( state, direction ) ) {
		dock( state, direction );
	} else if (
		getDockDirection( state ) === 0 &&
		canNavigate( state, direction )
	) {
		event.preventDefault();
		setActiveIndex( state, state.activeIndex + direction );
	}
};

const isEditableTarget = ( target ) => {
	if ( target?.nodeType !== 1 || typeof target.closest !== 'function' ) {
		return false;
	}

	return Boolean(
		target.closest(
			'input, textarea, select, button, [contenteditable]'
		) || target.closest( 'a[href]' )
	);
};

const handleKeyDown = ( state, event ) => {
	if ( state.panels.length < 2 || isEditableTarget( event.target ) ) {
		return;
	}

	const steps = {
		ArrowDown: 1,
		ArrowUp: -1,
		PageDown: 1,
		PageUp: -1,
		' ': event.shiftKey ? -1 : 1,
	};
	const step = steps[ event.key ];
	const isPageKey = event.key !== 'ArrowDown' && event.key !== 'ArrowUp';
	let nextIndex = null;

	if ( step && getDockDirection( state ) !== 0 ) {
		// A page key scrolls up to a whole window: reaching that far, it can never jump past.
		if (
			shouldDock(
				state,
				step,
				isPageKey ? window.innerHeight : undefined
			)
		) {
			event.preventDefault();
			dock( state, step );
		}
		return;
	}

	// Keys pressed or repeated while a slide is still moving wait for it: one slide per press.
	if ( step && state.isAnimating ) {
		event.preventDefault();
		return;
	}

	if ( getDockDirection( state ) !== 0 ) {
		return;
	}

	if ( step ) {
		nextIndex = state.activeIndex + step;
	} else if (
		( event.key === 'Home' || event.key === 'End' ) &&
		state.sequence.contains( event.target )
	) {
		// Home and End page the slides only when they have focus: elsewhere they move the page.
		nextIndex = event.key === 'Home' ? 0 : state.panels.length - 1;
	}

	if ( nextIndex === null ) {
		return;
	}

	const clampedIndex = clamp( nextIndex, 0, state.panels.length - 1 );

	if ( clampedIndex === state.activeIndex ) {
		return;
	}

	event.preventDefault();
	setActiveIndex( state, clampedIndex );
};

const isPendingSection = ( section ) =>
	section.dataset.nelyqoFullpageInitialized !== 'true' &&
	! section.closest( `.${ SEQUENCE_CLASS }` );

const getSectionGroups = () => {
	const groups = [];
	let currentGroup = [];

	Array.from( document.querySelectorAll( SECTION_SELECTOR ) )
		.filter( isPendingSection )
		.forEach( ( section ) => {
			const previousSection = currentGroup[ currentGroup.length - 1 ];
			const isConsecutive =
				previousSection &&
				section.parentElement === previousSection.parentElement &&
				section.previousElementSibling === previousSection;

			if ( ! isConsecutive && currentGroup.length > 0 ) {
				groups.push( currentGroup );
				currentGroup = [];
			}

			currentGroup.push( section );
		} );

	if ( currentGroup.length > 0 ) {
		groups.push( currentGroup );
	}

	return groups;
};

const createRuntimeSequence = ( panels ) => {
	const firstPanel = panels[ 0 ];
	const parent = firstPanel?.parentElement;

	if ( ! parent ) {
		return null;
	}

	const sequence = document.createElement( 'div' );
	const track = document.createElement( 'div' );

	sequence.className = SEQUENCE_CLASS;
	track.className = TRACK_CLASS;

	if ( panels.some( ( panel ) => panel.classList.contains( 'alignfull' ) ) ) {
		sequence.classList.add( 'alignfull' );
	} else if (
		panels.some( ( panel ) => panel.classList.contains( 'alignwide' ) )
	) {
		sequence.classList.add( 'alignwide' );
	}

	parent.insertBefore( sequence, firstPanel );
	sequence.appendChild( track );
	panels.forEach( ( panel ) => {
		panel.dataset.nelyqoFullpageInitialized = 'true';
		panel.classList.add( PANEL_CLASS );
		track.appendChild( panel );
	} );

	return {
		panels,
		sequence,
		track,
	};
};

const initSequence = ( panels ) => {
	if ( panels.length === 0 ) {
		return null;
	}

	const runtime = createRuntimeSequence( panels );

	if ( ! runtime ) {
		return null;
	}

	const state = {
		activeIndex: 0,
		approachFrom: null,
		isAnimating: false,
		panels: runtime.panels,
		reducedMotionQuery: window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		),
		sequence: runtime.sequence,
		track: runtime.track,
		touchStart: null,
		viewportHeight: 0,
		wheelDirection: 0,
		wheelDistance: 0,
		wheelGestureUsed: false,
		wheelLastStrength: 0,
		wheelLastTime: 0,
	};

	runtime.sequence.classList.add( READY_CLASS );
	runtime.sequence.style.setProperty(
		PROPERTY_PANEL_COUNT,
		String( panels.length )
	);
	updatePanelStates( state );

	if ( ! runtime.sequence.hasAttribute( 'tabindex' ) ) {
		runtime.sequence.setAttribute( 'tabindex', '0' );
	}

	// Wheel and keys are read on the whole page: the pointer may rest outside the slides (on the
	// header, or above them while they arrive), and arrow keys should page them without first
	// focusing them. Both handlers act only while the slides fill the screen or are arriving.
	// A page-wide non-passive wheel listener makes every scroll wait for the script, so it is
	// attached only while the slides are on screen.
	const onWheel = ( event ) => handleWheel( state, event );
	new window.IntersectionObserver( ( entries ) => {
		// A fast fling can queue an entry and an exit together: the last one is current.
		const entry = entries[ entries.length - 1 ];
		if ( entry.isIntersecting ) {
			window.addEventListener( 'wheel', onWheel, { passive: false } );
		} else {
			window.removeEventListener( 'wheel', onWheel );
			// Off screen: the next way in is from this side (1: they are below, -1: above).
			state.approachFrom = entry.boundingClientRect.top > 0 ? 1 : -1;
		}
	} ).observe( runtime.sequence );
	// A swipe that brings the slides in may start above them, so start and end are read page-wide;
	// neither blocks scrolling. touchmove, which can, stays on the slides (it acts only when docked).
	window.addEventListener(
		'touchstart',
		( event ) => handleTouchStart( state, event ),
		{ passive: true }
	);
	runtime.sequence.addEventListener(
		'touchmove',
		( event ) => handleTouchMove( state, event ),
		{ passive: false }
	);
	window.addEventListener(
		'touchend',
		( event ) => handleTouchEnd( state, event ),
		{ passive: false }
	);
	window.addEventListener( 'keydown', ( event ) =>
		handleKeyDown( state, event )
	);

	return state;
};

const bindGlobalEvents = () => {
	if ( globalsBound ) {
		return;
	}

	globalsBound = true;
	window.addEventListener( 'resize', requestMeasurements, { passive: true } );
	window.addEventListener( 'scroll', requestMeasurements, { passive: true } );
	window.visualViewport?.addEventListener( 'resize', requestMeasurements, {
		passive: true,
	} );
	window.addEventListener( 'load', requestMeasurements, { passive: true } );
};

const initFullpageSections = () => {
	const newInstances = getSectionGroups()
		.map( initSequence )
		.filter( Boolean );

	if ( newInstances.length === 0 ) {
		return;
	}

	instances.push( ...newInstances );
	document.documentElement.classList.add( HAS_SECTIONS_CLASS );
	bindGlobalEvents();
	requestMeasurements();
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initFullpageSections );
} else {
	initFullpageSections();
}
