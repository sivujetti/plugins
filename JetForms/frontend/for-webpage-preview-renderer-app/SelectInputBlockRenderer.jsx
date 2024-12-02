class SelectInputBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <div { ...createDefaultProps('form-group') }>
            { !block.label
                ? ''
                : <label class="form-label" htmlFor={ block.name }>{ block.label }</label>
            }
            <select
                class="form-select"
                name={ `${block.name}${block.multiple ? '[]' : ''}` }
                { ...(block.multiple ? {multiple: true} : {}) }>
                    { block.options.map(({value, text}) =>
                        <option value={ value }>{ __(text) }</option>
                    ) }
            </select>
            { renderChildren() }
        </div>;
    }
}
function __(s) {
    return s;
}

export default SelectInputBlockRenderer;
