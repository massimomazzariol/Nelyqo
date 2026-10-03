import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import './editor.scss';

const ALLOWED_BLOCKS = [
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/button',
	'core/image',
	'core/group',
	'core/list',
	'core/spacer',
	'nelyqo/horizontal-scroll-intro-card',
];

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: 'Track eyebrow',
			className: 'nelyqo-horizontal-scroll__eyebrow',
		},
	],
	[ 'core/heading', { level: 2, placeholder: 'Track title' } ],
	[
		'core/paragraph',
		{
			placeholder: 'Add intro copy for this horizontal section...',
		},
	],
	[ 'core/buttons' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'nelyqo-horizontal-scroll__content',
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
	} );

	return <div { ...innerBlocksProps } />;
}
