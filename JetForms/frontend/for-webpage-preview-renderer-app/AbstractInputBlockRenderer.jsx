class AbstractInputBlockRenderer extends preact.Component {
    /**
     * @returns {{inputType: String; inputMode?: String;}}
     * @access protected
     */
    getSettings() {
        throw new Error('Abstract method not implemented.');
    }
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        const {inputType, inputMode} = this.getSettings();
        const [El, attrs] = inputType !== 'textarea'
            ? ['input',    {inputType}]
            : ['textarea', !block.numRows ? {} : {rows: block.numRows}];
        return <div { ...createDefaultProps('form-group') }>
            { !block.label
                ? ''
                : <label class="form-label" htmlFor={ block.name }>{ block.label }</label>
            }
            <El
                name={ block.name }
                id={ block.name }
                class="form-input"
                { ...{
                    ...attrs,
                    ...(block.placeholder ? {'placeholder': block.placeholder} : {}),
                    ...(block.isRequired ? {'data-pristine-required': true} : {}),
                    ...(inputMode ? {'inputmode': inputMode} : {}),
                } }>
                    { renderChildren() }
            </El>
        </div>;
    }
}

export default AbstractInputBlockRenderer;
