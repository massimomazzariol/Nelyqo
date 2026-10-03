import {
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import './editor.scss';

const ALLOWED_BLOCKS = [
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/button',
	'core/image',
	'core/list',
	'core/separator',
];

const TEMPLATE = [
	[
		'core/paragraph',
		{
			placeholder: 'Eyebrow',
			className: 'nelyqo-horizontal-scroll__eyebrow',
		},
	],
	[ 'core/heading', { level: 2, placeholder: 'Intro title' } ],
	[ 'core/paragraph', { placeholder: 'Add intro copy...' } ],
	[ 'core/buttons' ],
];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'nelyqo-horizontal-scroll__intro-card',
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'nelyqo-horizontal-scroll__intro-card__inner' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}
