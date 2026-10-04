const ROOT_SELECTOR = '.wp-block-nelyqo-horizontal-scroll';
const CONTENT_SELECTOR = ':scope > .nelyqo-horizontal-scroll__content';
const LAYOUT_SELECTOR = ':scope > .nelyqo-horizontal-scroll__layout';
const SPACE_HOLDER_CLASS = 'nelyqo-horizontal-scroll__space-holder';
const STICKY_CLASS = 'nelyqo-horizontal-scroll__sticky';
const HORIZONTAL_CLASS = 'nelyqo-horizontal-scroll__horizontal';
const CARDS_CLASS = 'nelyqo-horizontal-scroll__cards';
const READY_CLASS = 'is-nelyqo-horizontal-ready';
const OVERFLOW_CLASS = 'has-nelyqo-horizontal-overflow';
const HAS_SECTIONS_CLASS = 'has-nelyqo-horizontal-sections';
const PROPERTY_HEADER_OFFSET = '--nelyqo-horizontal-measured-header-offset';
const PROPERTY_VIEWPORT_HEIGHT = '--nelyqo-horizontal-viewport-height';
const PROPERTY_TRACK_OFFSET = '--nelyqo-horizontal-track-offset';
const PROPERTY_SCROLL_DISTANCE = '--nelyqo-horizontal-scroll-distance';
const PROPERTY_PIN_TOP = '--nelyqo-horizontal-pin-top';
const DESKTOP_BREAKPOINT_PX = 782;
const EDGE_TOLERANCE_PX = 1;
const HEADER_SELECTOR = [
	'.wp-site-blocks > header',
	'body > header',
	'header.wp-block-template-part',
	'.site-header',
	'#site-header',
	'#masthead',
].join( ', ' );

const instances = [];
let globalsBound = false;
let updateFrame = null;

const clamp = ( value, min, max ) => Math.min( Math.max( value, min ), max );

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

const getHeaderOffset = () => {
	const adminBarHeight = getTopObstructionHeight(
		document.getElementById( 'wpadminbar' ),
		0
	);
	const headerHeight = getTopObstructionHeight(
		document.querySelector( HEADER_SELECTOR ),
		adminBarHeight
	);

	return Math.max( 0, Math.round( adminBarHeight + headerHeight ) );
};

const getViewportHeight = () =>
	window.visualViewport?.height ||
	window.innerHeight ||
	document.documentElement.clientHeight ||
	0;

const isDesktopViewport = () => window.innerWidth >= DESKTOP_BREAKPOINT_PX;

const createElement = ( className ) => {
	const element = document.createElement( 'div' );
	element.className = className;

	return element;
};

const createRuntimeStructure = ( root ) => {
	const existingSpaceHolder = root.querySelector(
		`:scope > .${ SPACE_HOLDER_CLASS }`
	);

	if ( existingSpaceHolder ) {
		return {
			horizontal: existingSpaceHolder.querySelector(
				`.${ HORIZONTAL_CLASS }`
			),
			layout: existingSpaceHolder.querySelector( `.${ CARDS_CLASS }` ),
			spaceHolder: existingSpaceHolder,
			sticky: existingSpaceHolder.querySelector( `.${ STICKY_CLASS }` ),
		};
	}

	const layout = root.querySelector( LAYOUT_SELECTOR );

	if ( ! layout ) {
		return null;
	}

	// New structure: content block exists as a sibling of the layout (track).
	// Content stays static inside sticky; only layout (cards) translates.
	// Legacy structure: only layout exists, everything inside translates.
	const contentEl = root.querySelector( CONTENT_SELECTOR );

	const spaceHolder = createElement( SPACE_HOLDER_CLASS );
	const sticky = createElement( STICKY_CLASS );
	const horizontal = createElement( HORIZONTAL_CLASS );

	layout.classList.add( CARDS_CLASS );

	if ( contentEl ) {
		// New: content and layout are siblings; insert spaceHolder before content,
		// move both into sticky - content first (static), then horizontal (translated).
		root.insertBefore( spaceHolder, contentEl );
		spaceHolder.appendChild( sticky );
		sticky.appendChild( contentEl );
		sticky.appendChild( horizontal );
		horizontal.appendChild( layout );
	} else {
		// Legacy: only layout; wrap entirely in horizontal so everything translates.
		root.insertBefore( spaceHolder, layout );
		spaceHolder.appendChild( sticky );
		sticky.appendChild( horizontal );
		horizontal.appendChild( layout );
	}

	return {
		horizontal,
		layout,
		spaceHolder,
		sticky,
	};
};

const getRootPageTop = ( root ) =>
	root.getBoundingClientRect().top + window.pageYOffset;

const measureInstance = ( state, headerOffset ) => {
	const viewportHeight = Math.max(
		0,
		Math.round( getViewportHeight() - headerOffset )
	);
	const rootTop = getRootPageTop( state.root );

	state.viewportHeight = viewportHeight;
	state.rootTop = rootTop;
	state.root.style.setProperty(
		PROPERTY_VIEWPORT_HEIGHT,
		`${ viewportHeight }px`
	);

	if ( ! isDesktopViewport() ) {
		state.pinTop = 0;
		state.scrollDistance = 0;
		state.root.classList.remove( OVERFLOW_CLASS );
		state.root.style.setProperty( PROPERTY_SCROLL_DISTANCE, '0px' );
		state.root.style.setProperty( PROPERTY_TRACK_OFFSET, '0px' );
		state.root.style.removeProperty( PROPERTY_PIN_TOP );
		state.spaceHolder.style.height = '';
		return;
	}

	// Use the constrained horizontal container as the visible window width.
	const stickyWidth =
		state.horizontal.clientWidth ||
		state.sticky.clientWidth ||
		state.root.clientWidth;
	const stickyHeight = state.sticky.clientHeight || viewportHeight;
	const trackWidth = state.layout.scrollWidth;
	const scrollDistance = Math.max( 0, trackWidth - stickyWidth );
	// endDwell: keeps last card visible before unstick, reduces bounce.
	const endDwell = Math.round( viewportHeight * 0.15 );
	// pinTop: centers the sticky visual area in the viewport below the header.
	// If the section is taller than the viewport, pin at header offset (top of useful viewport).
	const pinTop =
		headerOffset +
		Math.max( 0, Math.floor( ( viewportHeight - stickyHeight ) / 2 ) );

	state.pinTop = pinTop;
	state.scrollDistance = scrollDistance;
	state.root.classList.toggle(
		OVERFLOW_CLASS,
		scrollDistance > EDGE_TOLERANCE_PX
	);
	state.root.style.setProperty(
		PROPERTY_SCROLL_DISTANCE,
		`${ scrollDistance }px`
	);
	state.root.style.setProperty( PROPERTY_PIN_TOP, `${ pinTop }px` );
	state.spaceHolder.style.height = `${
		stickyHeight + scrollDistance + endDwell
	}px`;
};

const updateTransform = ( state ) => {
	if ( ! isDesktopViewport() || state.scrollDistance <= EDGE_TOLERANCE_PX ) {
		state.root.style.setProperty( PROPERTY_TRACK_OFFSET, '0px' );
		return;
	}

	const pinTop = state.pinTop || 0;
	// progress starts at 0 exactly when the sticky element pins at pinTop.
	// pageYOffset = rootTop - pinTop is the sticky threshold.
	const progress = clamp(
		window.pageYOffset + pinTop - state.rootTop,
		0,
		state.scrollDistance
	);

	state.root.style.setProperty(
		PROPERTY_TRACK_OFFSET,
		`${ -1 * progress }px`
	);
};

const updateInstances = () => {
	updateFrame = null;

	const headerOffset = getHeaderOffset();
	document.documentElement.style.setProperty(
		PROPERTY_HEADER_OFFSET,
		`${ headerOffset }px`
	);

	instances.forEach( ( state ) => {
		measureInstance( state, headerOffset );
		updateTransform( state );
	} );
};

const requestUpdate = () => {
	if ( updateFrame !== null ) {
		return;
	}

	updateFrame = window.requestAnimationFrame( updateInstances );
};

const initRoot = ( root ) => {
	if ( root.dataset.nelyqoHorizontalInitialized === 'true' ) {
		return null;
	}

	const runtime = createRuntimeStructure( root );

	if (
		! runtime?.spaceHolder ||
		! runtime.sticky ||
		! runtime.horizontal ||
		! runtime.layout
	) {
		return null;
	}

	const state = {
		horizontal: runtime.horizontal,
		layout: runtime.layout,
		pinTop: 0,
		root,
		rootTop: 0,
		scrollDistance: 0,
		spaceHolder: runtime.spaceHolder,
		sticky: runtime.sticky,
		viewportHeight: 0,
	};

	root.dataset.nelyqoHorizontalInitialized = 'true';
	root.classList.add( READY_CLASS );

	if ( 'ResizeObserver' in window ) {
		state.resizeObserver = new window.ResizeObserver( requestUpdate );
		state.resizeObserver.observe( root );
		state.resizeObserver.observe( runtime.layout );
		state.resizeObserver.observe( runtime.sticky );
	}

	return state;
};

const bindGlobalEvents = () => {
	if ( globalsBound ) {
		return;
	}

	globalsBound = true;
	window.addEventListener( 'scroll', requestUpdate, { passive: true } );
	window.addEventListener( 'resize', requestUpdate, { passive: true } );
	window.visualViewport?.addEventListener( 'resize', requestUpdate, {
		passive: true,
	} );
	window.addEventListener( 'load', requestUpdate, { passive: true } );
};

const initHorizontalScroll = () => {
	const newInstances = Array.from(
		document.querySelectorAll( ROOT_SELECTOR )
	)
		.map( initRoot )
		.filter( Boolean );

	if ( newInstances.length === 0 ) {
		return;
	}

	instances.push( ...newInstances );
	document.documentElement.classList.add( HAS_SECTIONS_CLASS );
	bindGlobalEvents();
	requestUpdate();
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initHorizontalScroll );
} else {
	initHorizontalScroll();
}
