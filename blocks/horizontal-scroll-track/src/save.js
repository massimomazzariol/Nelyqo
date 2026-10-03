import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( {
		className: 'nelyqo-horizontal-scroll__layout',
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks.Content />
		</div>
	);
}
