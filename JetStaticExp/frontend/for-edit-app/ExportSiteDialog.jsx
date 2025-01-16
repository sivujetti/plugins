import {
    __,
    env,
    FormGroupInline,
    handleSubmit,
    hasErrors,
    hookForm,
    http,
    Icon,
    Input,
    InputErrors,
    LoadingSpinner,
    stringUtils,
    unhookForm,
    urlUtils,
    validationConstraints,
} from '@sivujetti-commons-for-edit-app';
import {createCanonicalUrl, urlValidatorImpl} from '../../../../../frontend/commons-for-edit-app/validation.js';

class ExportSiteDialog extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        this.setState(hookForm(this, [
            {name: 'targetSiteDomain', value: 'https://' + __('mysite.com'), validations: [
                [urlValidatorImpl, {allowEmpty: false, allowLocal: false, allowLongLocal: false}],
                ['maxLength', validationConstraints.HARD_SHORT_TEXT_MAX_LEN]
            ], label: 'Domain'},
            {name: 'targetSiteBaseurl', value: '/', validations: [['required']], label: __('Directory')},
        ], {
            pages: null,
            files: null,
            isAllPagesSelected: true,
            isAllFilesSelected: true,
            exportResult: null,
        }));
        http.get('/plugins/jet-static-exp/exports/exportable-public-files')
            .then(urls => { // ['theme.css', 'file.js', ...]
                this.setState({files: urls.map(url => ({isSelected: true, url}))});
            })
            .catch(err => {
                env.window.console.error(err);
                this.setState({files: []});
            });
        http.get('/api/pages/Pages')
            .then(pages => {
                this.setState({pages: pages.map(({slug}) => ({isSelected: true, slug}))});
            })
            .catch(err => {
                env.window.console.error(err);
                this.setState({pages: []});
            });
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
    render(_, {pages, isAllPagesSelected, files, isAllFilesSelected, formIsSubmittingClass, exportResult}) {
        const submitBtnIsDisabled = !pages ? false : formIsSubmittingClass || (!getSelectedItems(pages).length && !files[0]) || hasErrors(this);
        return <form onSubmit={ e => handleSubmit(this, this.doExportSite.bind(this), e) } class="static-exp-form text-prose">
            <p>{ __('Save your website as a zip file that you can download and upload to your own web hosting, or use on platforms like GitHub Pages.') }</p>
            { !formIsSubmittingClass
                ? !exportResult
                    ? [
                        <div class="fieldset">
                            <div class="form-label legend">{ __('Pages') }</div>
                            <div>
                                <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleSetAllSelected(pages, e) }
                                        checked={ isAllPagesSelected }
                                        type="checkbox"
                                        disabled={ !pages }
                                        class="form-input"/><i class="form-icon"></i> ({ __('All') })
                                </label></div>
                                { pages ? pages.map((itm, i) => <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleIsSelected(pages, e, i) }
                                        checked={ itm.isSelected }
                                        type="checkbox"
                                        class="form-input"/><i class="form-icon"></i> { itm.slug }
                                </label></div>) : <LoadingSpinner className="mb-1"/> }
                            </div>
                        </div>,
                        <div class="fieldset">
                            <div class="form-label legend">{ __('Files') }</div>
                            <div>
                                <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleSetAllSelected(files, e) }
                                        checked={ isAllFilesSelected }
                                        type="checkbox"
                                        disabled={ !files }
                                        class="form-input"/><i class="form-icon"></i> ({ __('All') })
                                </label></div>
                                { files ? files.map((itm, i) => <div><label class="form-checkbox d-inline-block c-hand my-0">
                                    <input
                                        onClick={ e => this.toggleIsSelected(files, e, i) }
                                        checked={ itm.isSelected }
                                        type="checkbox"
                                        class="form-input"/><i class="form-icon"></i> { itm.url }
                                </label></div>) : <LoadingSpinner className="mb-1"/> }
                            </div>
                        </div>,
                        <div class="fieldset mb-2">
                            <div class="form-label legend">{ __('Target site info') }</div>
                            <div class="form-horizontal">
                                <FormGroupInline className="mt-1">
                                    <label htmlFor="targetSiteDomain" class="form-label">
                                        Domain
                                        <span class="tooltip tooltip-right p-absolute mt-1 ml-1" data-tooltip={ __('Web hosting or service where\nyou will upload the site') }>
                                            <Icon iconId="info-circle" className="color-dimmed3 size-xs"/>
                                        </span>
                                    </label>
                                    <Input vm={ this } prop="targetSiteDomain" id="targetSiteDomain"/>
                                    <InputErrors vm={ this } prop="targetSiteDomain"/>
                                </FormGroupInline>
                                <FormGroupInline className="mb-1">
                                    <label htmlFor="targetSiteBaseurl" class="form-label">{ __('Directory') }</label>
                                    <Input vm={ this } prop="targetSiteBaseurl" id="targetSiteBaseurl" disabled/>
                                </FormGroupInline>
                            </div>
                        </div>
                    ]
                    : <p class="info-box success mb-0" style="margin-top: -.2rem">
                        { __('Success! Download your site here: ') }
                        <a href={ urlUtils.makeAssetUrl(exportResult, true) }>{ urlUtils.makeAssetUrl(exportResult, false) }</a>.
                    </p>
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
            pages: getSelectedItems(this.state.pages).map(({slug}) => slug),
            files: getSelectedItems(this.state.files).map(({url}) => url),
            targetHost: createCanonicalUrl(this.state.values.targetSiteDomain)[0],
            targetBaseUrl: this.state.values.targetSiteBaseurl,
        })
        .then(res => {
            if (res.ok === 'ok')
                this.setState({exportResult: res.resultFileUrl});
        });
    }
    /**
     * @param {Array<SelectItem>} list
     * @param {Event} e
     * @param {number} i
     * @access private
     */
    toggleIsSelected(list, e, i) {
        const t = getListType(list[0]);
        this.setState({[t]: list.map((itm, i2) =>
            i2 !== i ? itm : {...itm, ...{isSelected: e.target.checked}}
        )});
    }
    /**
     * @param {Array<SelectItem>} list
     * @param {Event} e
     * @access private
     */
    toggleSetAllSelected(list, e) {
        const to = e.target.checked;
        const t = getListType(list[0]);
        this.setState({
            [`isAll${stringUtils.capitalize(t)}Selected`]: to,
            [t]: list.map(itm => ({...itm, isSelected: to}))
        });
    }
}

/**
 * @param {Array<SelectItem>} pages
 * @returns {Array<SelectItem>}
 */
function getSelectedItems(pages) {
    return pages.filter(itm => itm.isSelected);
}

/**
 * @param {SelectItem} itm
 * @returns {'pages'|'files'}
 */
function getListType(itm) {
    return itm.slug ? 'pages' : 'files';
}

/**
 * @typedef SelectItem
 * @property {boolean} isSelected
 * @property {string?} slug
 * @property {string?} url
 */

export default ExportSiteDialog;
