function __(s) { return s; }

class IconBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <span { ...createDefaultProps() }>
            { block.iconId && block.cachedInlineSvg
                ? <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={ `icon icon-tabler icon-tabler-${block.iconId}` }
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={ {__html: block.cachedInlineSvg} }></svg>
                : <span
                    title={ __('Waits for configuration ...') }
                    style="border: 1px dashed;display: inline-block;padding: 11px;"></span>
            }
            { renderChildren() }
        </span>;
    }
}

export default IconBlockRenderer;