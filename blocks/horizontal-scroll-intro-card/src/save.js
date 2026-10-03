import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save() {
	const blockProps = useBlockProps.save( {
		className: 'nelyqo-horizontal-scroll__intro-card',
	} );
	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'nelyqo-horizontal-scroll__intro-card__inner',
	} );

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}
