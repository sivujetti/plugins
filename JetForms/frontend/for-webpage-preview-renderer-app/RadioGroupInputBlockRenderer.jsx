class RadioGroupInputBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <div { ...createDefaultProps('form-group') }>
            { block.label
                ? <div class="form-label">{ block.label }</div>
                : null }
            { block.radios.map(radio => <label class="form-radio">
                <input
                    name={ block.name }
                    value={ radio.value }
                    type="radio"
                    { ...(block.isRequired ? {'data-pristine-required': ''} : {}) }/>
                <i class="form-icon"></i> { radio.text }
            </label>) }
            { renderChildren() }
        </div>;
    }
}

export default RadioGroupInputBlockRenderer;
