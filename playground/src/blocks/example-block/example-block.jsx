import './example-block.pcss';
import metadata from './example-block.json';

const { registerBlockType } = wp.blocks;
const { __ } = wp.i18n;
const { useBlockProps } = wp.blockEditor;

export default function Edit() {
  return <p {...useBlockProps()}>{__('Example Block – hello from the editor!', 'example-block')}</p>;
}

registerBlockType(metadata.name, {
  edit: Edit,
});
