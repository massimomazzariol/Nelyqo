/**
 * Nelyqo horizontal engine: one engine for the Horizontal Scroll block and the Scroll Section
 * horizontal track mode. The page scrolls down, the stage holds still in the middle of the screen
 * and the cards travel sideways, as far as the page scrolls; after the last card the stage holds a
 * moment, then lets go.
 *
 * The script measures (on load and on resize only) and the browser moves: the track, the progress
 * bar and the end of the travel are scroll-driven CSS animations (assets/css/horizontal-engine.css)
 * whose range the script sets in px. Where scroll-driven animations are missing, a passive scroll
 * listener moves the track instead. The script also eases the cards in and out of focus (card
 * emphasis, one custom property per card) and settles the track on a whole card when scrolling
 * stops, when those options are on. With reduced motion nothing is pinned: the cards stay in a
 * sideways scroller (or a stack on phones), as without the script.
 *
 * Options come as classes added at render time from the block attributes (functions.php), so the
 * saved markup never changes.
 */
( () => {
	const HEADER_SELECTOR = [
		'.nelyqo-overlay-header',
		'.wp-site-blocks > header',
		'body > header',
		'header.wp-block-template-part',
	].join( ', ' );
	// Share of the screen height the stage holds after the last card arrives.
	const END_HOLD_RATIO = 0.15;
	// Page scroll per px of track travel, per speed option.
	const SPEEDS = { slow: 1.5, normal: 1, fast: 0.6 };
	// Scrolling has stopped when no scroll event came for this long (browsers without scrollend).
	const SCROLL_IDLE_MS = 150;

	const reducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	);
	const hasTimeline =
		window.CSS?.supports?.( 'animation-timeline: view()' ) &&
		window.CSS.supports( 'animation-range: cover 0px cover 1px' );
	const instances = [];
	let frame = null;
	let headerOffset = 0;

	const clamp = ( value, min, max ) =>
		Math.min( max, Math.max( min, value ) );
	const scrollportHeight = () =>
		document.documentElement.clientHeight || window.innerHeight || 1;
	const pageTop = ( element ) =>
		element.getBoundingClientRect().top + window.scrollY;

	// Height of what covers the top of the screen: the admin bar and a sticky or fixed header.
	const measureHeader = () => {
		const bar = document.getElementById( 'wpadminbar' );
		let offset =
			bar && window.getComputedStyle( bar ).position === 'fixed'
				? bar.getBoundingClientRect().height
				: 0;
		const header = document.querySelector( HEADER_SELECTOR );
		if ( header ) {
			const position = window.getComputedStyle( header ).position;
			if ( position === 'sticky' || position === 'fixed' ) {
				offset = Math.max(
					offset,
					header.getBoundingClientRect().bottom
				);
			}
		}
		return Math.max( 0, Math.round( offset ) );
	};

	/*
	 * Each block keeps its own markup and styles; an adapter builds its runtime track and tells the
	 * engine where things are. build() returns { shell, track, cards } or null; stageHeight(),
	 * staticTop() and pin() handle what differs between the two blocks.
	 */
	const ADAPTERS = [
		{
			selector:
				'.wp-block-nelyqo-scroll-section.is-mode-horizontal-track',
			breakpoint: 960,
			canPin: ( root ) => root.classList.contains( 'has-sticky' ),
			emphasis: ( root ) =>
				root.classList.contains( 'has-motion' ) &&
				! root.classList.contains( 'has-no-card-emphasis' ),
			build( root ) {
				const layout = root.querySelector(
					':scope > .nelyqo-scroll-section__layout'
				);
				const intro = layout?.querySelector(
					':scope > .nelyqo-scroll-section__intro'
				);
				if ( ! intro ) {
					return null;
				}
				const shell = document.createElement( 'div' );
				shell.className = 'nelyqo-scroll-section__horizontal-shell';
				const track = document.createElement( 'div' );
				track.className = 'nelyqo-scroll-section__horizontal-track';
				shell.appendChild( track );
				intro.after( shell );
				layout
					.querySelectorAll( ':scope > .wp-block-nelyqo-scroll-card' )
					.forEach( ( card ) => track.appendChild( card ) );
				// The track scrolls sideways on its own when it is not pinned: keyboard users need to reach it.
				shell.tabIndex = 0;
				root.classList.add( 'is-horizontal-enhanced' );
				return {
					layout,
					intro,
					shell,
					track,
					cards: [ ...track.children ],
				};
			},
			stageHeight( state, viewport ) {
				const content = Math.max(
					state.intro.offsetHeight,
					state.shell.offsetHeight
				);
				return Math.ceil(
					Math.max(
						360,
						content,
						Math.min(
							viewport * 0.58,
							viewport - headerOffset - 12
						)
					)
				);
			},
			// The layout is the first thing in the section: it pins from the section's padding.
			staticTop: ( state ) =>
				parseFloat(
					window.getComputedStyle( state.root ).paddingTop
				) || 0,
			pin( state, on ) {
				const { root } = state;
				root.classList.toggle( 'is-horizontal-pinned', on );
				if ( ! on ) {
					root.style.removeProperty(
						'--nelyqo-scroll-horizontal-stage-height'
					);
					root.style.removeProperty(
						'--nelyqo-scroll-horizontal-section-height'
					);
					return;
				}
				const style = window.getComputedStyle( root );
				root.style.setProperty(
					'--nelyqo-scroll-horizontal-stage-height',
					`${ state.stageHeight }px`
				);
				root.style.setProperty(
					'--nelyqo-scroll-horizontal-pin-top',
					`${ state.pinTop }px`
				);
				root.style.setProperty(
					'--nelyqo-scroll-horizontal-section-height',
					`${ Math.ceil(
						state.stageHeight +
							state.travel +
							state.endHold +
							parseFloat( style.paddingTop ) +
							parseFloat( style.paddingBottom )
					) }px`
				);
			},
		},
		{
			selector: '.wp-block-nelyqo-horizontal-scroll',
			breakpoint: 782,
			canPin: () => true,
			emphasis: ( root ) => root.classList.contains( 'has-h-emphasis' ),
			build( root ) {
				const layout = root.querySelector(
					':scope > .nelyqo-horizontal-scroll__layout'
				);
				if ( ! layout ) {
					return null;
				}
				const make = ( className ) => {
					const element = document.createElement( 'div' );
					element.className = className;
					return element;
				};
				const holder = make( 'nelyqo-horizontal-scroll__space-holder' );
				const sticky = make( 'nelyqo-horizontal-scroll__sticky' );
				const shell = make( 'nelyqo-horizontal-scroll__horizontal' );
				const content = root.querySelector(
					':scope > .nelyqo-horizontal-scroll__content'
				);
				layout.classList.add( 'nelyqo-horizontal-scroll__cards' );
				// The content stays still in the stage; only the cards travel.
				root.insertBefore( holder, content || layout );
				holder.appendChild( sticky );
				if ( content ) {
					sticky.appendChild( content );
				}
				sticky.appendChild( shell );
				shell.appendChild( layout );
				return {
					holder,
					sticky,
					shell,
					track: layout,
					cards: [
						...layout.querySelectorAll(
							':scope > .wp-block-nelyqo-scroll-card'
						),
					],
				};
			},
			// The stage fills the screen below the header (its CSS); its content is centred in it.
			stageHeight: ( state ) => state.sticky.offsetHeight,
			staticTop: ( state ) => state.holder.offsetTop,
			pin( state, on ) {
				const { root, holder } = state;
				root.classList.toggle( 'is-nelyqo-horizontal-ready', on );
				root.style.setProperty(
					'--nelyqo-horizontal-pin-top',
					`${ state.pinTop }px`
				);
				holder.style.height = on
					? `${ Math.ceil(
							state.stageHeight + state.travel + state.endHold
					  ) }px`
					: '';
			},
		},
	];

	// Where the cards' centres meet the middle of the window, as a share of the travel (0 to 1).
	const measureFocus = ( state ) => {
		const shell = state.shell.getBoundingClientRect();
		const track = state.track.getBoundingClientRect();
		const focus = shell.left + shell.width / 2;
		state.focus = state.cards.map( ( card ) => {
			const rect = card.getBoundingClientRect();
			const centre = rect.left - track.left + rect.width / 2;
			return clamp(
				( focus - track.left - centre ) /
					( state.sign * state.distance ),
				0,
				1
			);
		} );
	};

	const measure = ( state ) => {
		const { root, adapter, shell, track } = state;
		const pinnable =
			window.innerWidth >= adapter.breakpoint &&
			! reducedMotion.matches &&
			adapter.canPin( root );
		// Cards travel left, or right when asked (or in right-to-left languages): the window is laid
		// out in that direction, so the first card starts on the side the cards come from.
		const pageDirection = window.getComputedStyle( root ).direction;
		const right = root.classList.contains( 'is-h-dir-right' )
			? true
			: ! root.classList.contains( 'is-h-dir-left' ) &&
			  pageDirection === 'rtl';
		shell.dir = right ? 'rtl' : 'ltr';
		state.cards.forEach( ( card ) => {
			card.dir = pageDirection;
		} );
		state.sign = right ? 1 : -1;

		// Measure the track at rest (no animation, no fallback offset), in its pinned layout.
		root.classList.remove( 'is-h-timeline' );
		track.style.translate = '';
		const unpin = () => {
			state.pinned = false;
			adapter.pin( state, false );
			root.classList.remove( 'is-h-pinned' );
			state.cards.forEach( ( card ) =>
				card.style.removeProperty( '--nelyqo-h-e' )
			);
		};
		if ( ! pinnable ) {
			unpin();
			return;
		}
		const viewport = scrollportHeight();
		Object.assign( state, { travel: 0, endHold: 0, pinTop: headerOffset } );
		state.stageHeight = adapter.stageHeight( state, viewport );
		adapter.pin( state, true );
		root.classList.add( 'is-h-pinned' );
		state.distance = Math.max( 0, track.scrollWidth - shell.clientWidth );
		if ( state.distance <= 1 ) {
			unpin();
			return;
		}
		state.pinned = true;

		const speed =
			SPEEDS[
				[ 'slow', 'fast' ].find( ( name ) =>
					root.classList.contains( `is-h-speed-${ name }` )
				) || 'normal'
			];
		state.travel = Math.round( state.distance * speed );
		state.endHold = Math.round( viewport * END_HOLD_RATIO );
		state.stageHeight = adapter.stageHeight( state, viewport );
		// Centred in the part of the screen below the header.
		state.pinTop =
			headerOffset +
			Math.max(
				0,
				Math.round(
					( viewport - headerOffset - state.stageHeight ) / 2
				)
			);
		adapter.pin( state, true );
		measureFocus( state );

		// The travel starts when the stage pins: that many px into the section's cover range,
		// which begins when the section's top meets the bottom of the screen.
		state.start = viewport + adapter.staticTop( state ) - state.pinTop;
		state.pinScroll = pageTop( root ) + state.start - viewport;
		root.style.setProperty( '--nelyqo-h-start', `${ state.start }px` );
		root.style.setProperty(
			'--nelyqo-h-end',
			`${ state.start + state.travel }px`
		);
		root.style.setProperty(
			'--nelyqo-h-shift',
			`${ state.sign * state.distance }px`
		);
		root.classList.toggle( 'is-h-timeline', hasTimeline );
	};

	// Progress through the travel (0 to 1), from the page position alone: no layout is read.
	const progressOf = ( state ) =>
		clamp( ( window.scrollY - state.pinScroll ) / state.travel, 0, 1 );

	const update = ( state ) => {
		if ( ! state.pinned ) {
			return;
		}
		const progress = progressOf( state );
		if ( ! hasTimeline ) {
			state.track.style.translate = `${
				progress * state.sign * state.distance
			}px 0`;
			state.root.style.setProperty(
				'--nelyqo-h-progress',
				progress.toFixed( 4 )
			);
		}
		if ( ! state.emphasis ) {
			return;
		}
		// Each card is fully lit when it reaches the middle of the window, fainter one card away.
		const pitch = 1 / Math.max( 1, state.cards.length - 1 );
		let active = 0;
		state.cards.forEach( ( card, index ) => {
			const distance = Math.abs( progress - state.focus[ index ] );
			const lit = clamp( 1 - distance / pitch, 0, 1 ).toFixed( 3 );
			if ( card.style.getPropertyValue( '--nelyqo-h-e' ) !== lit ) {
				card.style.setProperty( '--nelyqo-h-e', lit );
			}
			if ( distance < Math.abs( progress - state.focus[ active ] ) ) {
				active = index;
			}
		} );
		if ( active !== state.active ) {
			state.active = active;
			state.cards.forEach( ( card, index ) => {
				card.classList.toggle( 'is-active', index === active );
				card.classList.toggle( 'is-before-active', index < active );
				card.classList.toggle( 'is-after-active', index > active );
			} );
		}
	};

	// When scrolling stops inside the travel, finish the move to the next whole card in the
	// direction the page was going (never back against it, never in the end hold or outside).
	const settle = ( state ) => {
		if (
			! state.pinned ||
			! state.root.classList.contains( 'has-h-settle' ) ||
			state.settling
		) {
			return;
		}
		const progress = progressOf( state );
		if ( progress <= 0 || progress >= 1 ) {
			return;
		}
		const stops = [ ...new Set( state.focus ) ].sort( ( a, b ) => a - b );
		const forward = state.lastDirection >= 0;
		const target = forward
			? stops.find( ( stop ) => stop >= progress - 0.001 )
			: [ ...stops ]
					.reverse()
					.find( ( stop ) => stop <= progress + 0.001 );
		if (
			target === undefined ||
			Math.abs( target - progress ) * state.travel < 2
		) {
			return;
		}
		state.settling = true;
		window.scrollTo( {
			top: state.pinScroll + target * state.travel,
			behavior: 'smooth',
		} );
	};

	const requestUpdate = () => {
		if ( frame !== null ) {
			return;
		}
		frame = window.requestAnimationFrame( () => {
			frame = null;
			instances.forEach( update );
		} );
	};

	const remeasure = () => {
		headerOffset = measureHeader();
		instances.forEach( ( state ) => {
			measure( state );
			state.active = -1;
			state.emphasis =
				state.pinned && state.adapter.emphasis( state.root );
			state.root.classList.toggle( 'is-h-emphasis', state.emphasis );
			update( state );
		} );
	};

	const init = () => {
		ADAPTERS.forEach( ( adapter ) => {
			document.querySelectorAll( adapter.selector ).forEach( ( root ) => {
				if ( root.dataset.nelyqoHorizontal ) {
					return;
				}
				const parts = adapter.build( root );
				if ( ! parts || ! parts.cards.length ) {
					return;
				}
				root.dataset.nelyqoHorizontal = 'ready';
				parts.track.classList.add( 'nelyqo-h-track' );
				parts.cards.forEach( ( card ) =>
					card.classList.add( 'nelyqo-h-card' )
				);
				if ( root.classList.contains( 'has-h-progress' ) ) {
					const bar = document.createElement( 'span' );
					bar.className = 'nelyqo-h-progress';
					bar.setAttribute( 'aria-hidden', 'true' );
					parts.shell.appendChild( bar );
				}
				instances.push( {
					root,
					adapter,
					...parts,
					active: -1,
					lastDirection: 1,
					lastY: window.scrollY,
				} );
			} );
		} );
		if ( ! instances.length ) {
			return;
		}

		let idle = null;
		window.addEventListener(
			'scroll',
			() => {
				const y = window.scrollY;
				instances.forEach( ( state ) => {
					if ( y !== state.lastY ) {
						state.lastDirection = y > state.lastY ? 1 : -1;
						state.lastY = y;
					}
				} );
				requestUpdate();
				if ( ! ( 'onscrollend' in window ) ) {
					window.clearTimeout( idle );
					idle = window.setTimeout(
						() =>
							window.dispatchEvent(
								new Event( 'nelyqo-scrollend' )
							),
						SCROLL_IDLE_MS
					);
				}
			},
			{ passive: true }
		);
		const onScrollEnd = () =>
			instances.forEach( ( state ) => {
				// The end of our own settling move ends the settling, it does not start another.
				if ( state.settling ) {
					state.settling = false;
					return;
				}
				settle( state );
			} );
		window.addEventListener( 'scrollend', onScrollEnd );
		window.addEventListener( 'nelyqo-scrollend', onScrollEnd );
		// Any new input cancels a settling move in progress, so the page never fights the user.
		[ 'wheel', 'touchstart', 'keydown' ].forEach( ( type ) =>
			window.addEventListener(
				type,
				() =>
					instances.forEach( ( state ) => {
						state.settling = false;
					} ),
				{ passive: true }
			)
		);

		let resizeFrame = null;
		const requestMeasure = () => {
			if ( resizeFrame === null ) {
				resizeFrame = window.requestAnimationFrame( () => {
					resizeFrame = null;
					remeasure();
				} );
			}
		};
		window.addEventListener( 'resize', requestMeasure );
		window.addEventListener( 'load', requestMeasure );
		reducedMotion.addEventListener?.( 'change', requestMeasure );
		document.fonts?.ready.then( requestMeasure ).catch( () => {} );
		if ( 'ResizeObserver' in window ) {
			const observer = new window.ResizeObserver( requestMeasure );
			instances.forEach( ( state ) => observer.observe( state.track ) );
		}
		remeasure();
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
