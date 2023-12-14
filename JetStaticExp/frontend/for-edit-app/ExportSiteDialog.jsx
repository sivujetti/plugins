import {__, http, env, LoadingSpinner, hookForm, unhookForm, FormGroupInline, Input,
        InputErrors, handleSubmit, Icon, validationConstraints} from '@sivujetti-commons-for-edit-app';

class ExportSiteDialog extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        this.setState({pages: null, selectedPages: [], exportResult: null});
    }
    /**
     * @access protected
     */
    render(_, {pages, formIsSubmittingClass, exportResult}) {
        return <form onSubmit={ e => handleSubmit(this, this.doExportSite.bind(this), e) }>
            <div class="mb-1">{ __('jetStaticExpTodo1') }</div>
            { pages ? <div>
                <div>{ exportResult }</div>
            </div> : <LoadingSpinner/> }
            <div class="mt-8">
                <button
                    class={ `btn btn-primary mr-2${formIsSubmittingClass}` }
                    type="submit">{ __('Export') }</button>
                <button
                    onClick={ () => this.props.floatingDialog.close() }
                    class="btn btn-link"
                    type="button">{ __('Cancel') }</button>
            </div>
        </form>;
    }
    /**
     * @access private
     */
    doExportSite() {
        return http.post('/plugins/jet-static-exp/exports/export', {
            pages: this.state.selectedPages,
            targetHost: 'https://goo.com',
            targetBaseUrl: '/',
            targetQueryVar: ''
        })
        .then(res => { // error handling??
            if (res.ok === "ok")
                this.setState({sskd: res.resultFileUrl});
        });
    }
}

export default ExportSiteDialog;
