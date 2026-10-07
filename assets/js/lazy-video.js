/* Plays autoplay videos (marked by the theme) only near the viewport; see nelyqo_lazy_video(). */
const nelyqoReduceMotion = window.matchMedia(
	'(prefers-reduced-motion: reduce)'
).matches;

const nelyqoObserver = new window.IntersectionObserver(
	( entries ) => {
		entries.forEach( ( entry ) => {
			const video = entry.target;
			if ( nelyqoReduceMotion ) {
				// Reduced motion: no playback, just the first frame instead of a blank box.
				if ( entry.isIntersecting ) {
					video.preload = 'metadata';
					nelyqoObserver.unobserve( video );
				}
			} else if ( entry.isIntersecting ) {
				video.preload = 'auto';
				video.play().catch( () => {} );
			} else if ( ! video.paused ) {
				video.pause();
			}
		} );
	},
	{ rootMargin: '200px 0px' }
);

document
	.querySelectorAll( 'video[data-nelyqo-autoplay]' )
	.forEach( ( video ) => nelyqoObserver.observe( video ) );
