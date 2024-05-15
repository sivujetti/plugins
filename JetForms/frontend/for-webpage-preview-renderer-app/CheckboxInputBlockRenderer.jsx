class CheckboxInputBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <div { ...createDefaultProps('form-group') }>
            <label class="form-checkbox">
                <input
                    name={ `${block.name}` }
                    type="checkbox"
                    { ...(block.isRequired ? {'data-pristine-required': ''} : {}) }/>
                <i class="form-icon"></i> { block.label }
            </label>
            { renderChildren() }
        </div>;
    }
}

export default CheckboxInputBlockRenderer;
