class TaskPageProcessorBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <span { ...createDefaultProps() }>
            todo
            { renderChildren() }
        </span>;
    }
}

export default TaskPageProcessorBlockRenderer;