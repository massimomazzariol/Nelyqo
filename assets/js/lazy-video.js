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
				// The first video of the page kept autoplay, so stop it too.
				video.autoplay = false;
				video.pause();
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
	{ rootMargin: window.nelyqoLazyVideo?.rootMargin }
);

document
	.querySelectorAll( 'video[data-nelyqo-autoplay]' )
	.forEach( ( video ) => nelyqoObserver.observe( video ) );
