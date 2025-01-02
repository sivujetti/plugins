import {
    __,
    env,
    FormGroupInline,
    handleSubmit,
    hasErrors,
    hookForm,
    http,
    Input,
    InputErrors,
    LoadingSpinner,
    unhookForm,
    urlUtils,
    validationConstraints,
} from '@sivujetti-commons-for-edit-app';
import {urlValidatorImpl} from '../../../../../frontend/commons-for-edit-app/validation.js';

class ExportSiteDialog extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        this.setState(hookForm(this, [
            {name: 'targetSiteDomain', value: 'https://domain.com', validations: [
                [urlValidatorImpl, {allowEmpty: false, allowLocal: false, allowLongLocal: false}],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]
            ], label: 'Domain'},
            {name: 'targetSiteBaseurl', value: '/', validations: [['required']], label: __('Directory')},
            {name: 'targetSiteQueryVar', value: '', validations: [['required']], label: __('Query variable')},
        ], {
            selectedPages: null,
            selectedFiles: ['all'],
            allPagesSelected: true,
            exportResult: null,
        }));
        http.get('/api/pages/Pages')
            .then(pages => { this.setState({selectedPages: pages.map(({slug}) => ({isSelected: true, slug}))}); })
            .catch(env.window.console.error);
    }
    /**
     * @access protected
     */
    componentWillUnmount() {
        unhookForm(this);
    }
    /**
     * @access protected
     */
    render(_, {selectedPages, allPagesSelected, selectedFiles, formIsSubmittingClass, exportResult}) {
        const submitBtnIsDisabled = !selectedPages ? false : formIsSubmittingClass || !getSelectedItems(selectedPages).length || hasErrors(this);
        const allFilesIsSelected = selectedFiles[0] === 'all';
        return <form onSubmit={ e => handleSubmit(this, this.doExportSite.bind(this), e) } class="static-exp-form">
            { !formIsSubmittingClass
                ? !exportResult
                    ? [
                        selectedPages ? <div class="fieldset">
                            <div class="form-label legend text-bold">{ __('Pages') }</div>
                            <div>
                                <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleSetAllSelected(e) }
                                        checked={ allPagesSelected }
                                        type="checkbox"
                                        class="form-input"/><i class="form-icon"></i> ({ __('All') })
                                </label></div>
                                { selectedPages.map((itm, i) => <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleIsSelected(e, i) }
                                        checked={ itm.isSelected }
                                        type="checkbox"
                                        class="form-input"/><i class="form-icon"></i> { itm.slug }
                                </label></div>) }
                                <div>{ exportResult }</div>
                            </div>
                        </div>: <LoadingSpinner/>,
                        <div class="fieldset">
                            <div class="form-label legend text-bold">{ __('Files') }</div>
                            <div>
                                <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ () => this.setState({selectedFiles: allFilesIsSelected ? [] : ['all']}) }
                                        checked={ allFilesIsSelected }
                                        type="checkbox"
                                        class="form-input"/><i class="form-icon"></i> ({ __('All') })
                                </label></div>
                            </div>
                        </div>,
                        <div class="fieldset mb-2">
                            <div class="form-label legend text-bold">{ __('Target site info') }</div>
                            <div class="form-horizontal">
                                <FormGroupInline className="mt-1">
                                    <label htmlFor="targetSiteDomain" class="form-label">Domain</label>
                                    <Input vm={ this } prop="targetSiteDomain" id="targetSiteDomain"/>
                                    <InputErrors vm={ this } prop="targetSiteDomain"/>
                                </FormGroupInline>
                                <FormGroupInline>
                                    <label htmlFor="targetSiteBaseurl" class="form-label">{ __('Directory') }</label>
                                    <Input vm={ this } prop="targetSiteBaseurl" id="targetSiteBaseurl" disabled/>
                                </FormGroupInline>
                                <FormGroupInline className="mb-1">
                                    <label htmlFor="targetSiteQueryVar" class="form-label">{ __('Query variable') }</label>
                                    <Input vm={ this } prop="targetSiteQueryVar" id="targetSiteQueryVar" disabled/>
                                </FormGroupInline>
                            </div>
                        </div>
                    ]
                    : <div class="pb-1">
                        { __('Success! Download your site here: ') }
                        <a href={ urlUtils.makeUrl(exportResult) }>{ exportResult }</a>.
                    </div>
                : <div class="pb-1"><LoadingSpinner/></div>
            }
            <div class="mt-8 pt-2">
                <button
                    class={ `btn btn-primary mr-2${formIsSubmittingClass}` }
                    disabled={ submitBtnIsDisabled }
                    type="submit">{ __('Export') }</button>
                <button
                    onClick={ () => this.props.floatingDialog.close() }
                    class="btn btn-link"
                    disabled={ formIsSubmittingClass !== '' }
                    type="button">{ __('Cancel') }</button>
            </div>
        </form>;
    }
    /**
     * @access private
     */
    doExportSite() {
        return http.post('/plugins/jet-static-exp/exports/export', {
            pages: getSelectedItems(this.state.selectedPages).map(({slug}) => slug),
            files: this.state.selectedFiles,
            targetHost: this.state.values.targetSiteDomain,
            targetBaseUrl: this.state.values.targetSiteBaseurl,
            targetQueryVar: this.state.values.targetSiteQueryVar,
        })
        .then(res => {
            if (res.ok === 'ok')
                this.setState({exportResult: res.resultFileUrl});
        });
    }
    /**
     * @param {Event} e
     * @param {number} i
     * @access private
     */
    toggleIsSelected(e, i) {
        this.setState({selectedPages: this.state.selectedPages.map((itm, i2) =>
            i2 !== i ? itm : {...itm, ...{isSelected: e.target.checked}}
        )});
    }
    /**
     * @param {Event} e
     * @access private
     */
    toggleSetAllSelected(e) {
        const to = e.target.checked;
        this.setState({
            allPagesSelected: to,
            selectedPages: this.state.selectedPages.map(itm => ({...itm, isSelected: to}))
        });
    }
}

/**
 * @param {Array<SelectItem>} selectedPages
 * @returns {Array<SelectItem>}
 */
function getSelectedItems(selectedPages) {
    return selectedPages.filter(itm => itm.isSelected);
}

/**
 * @typedef SelectItem
 * @property {boolean} isSelected
 * @property {string} slug
 */

export default ExportSiteDialog;
