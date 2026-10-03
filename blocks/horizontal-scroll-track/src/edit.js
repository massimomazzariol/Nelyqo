import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import './editor.scss';

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'nelyqo-horizontal-scroll__layout',
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'nelyqo/scroll-card' ],
		template: [ [ 'nelyqo/scroll-card' ], [ 'nelyqo/scroll-card' ] ],
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return <div { ...innerBlocksProps } />;
}
