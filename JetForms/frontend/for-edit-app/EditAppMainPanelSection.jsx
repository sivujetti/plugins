import {__, Icon, floatingDialog} from '@sivujetti-commons-for-edit-app';
import {Section} from '../../../../../frontend/edit-app/src/DefaultView/OnThisPageSection.jsx';
import MailSendSettingsManageDialog from './MailSendSettings/MailSendSettingsManageDialog.jsx';

class EditAppMainPanelSection extends Section {
    /**
     * @access protected
     */
    render(_, {isCollapsed}) {
        return <section class={ `panel-section${isCollapsed ? '' : ' open'}` }>
            <button class="d-flex col-12 flex-centered pr-2" onClick={ () => { this.setState({isCollapsed: !isCollapsed}); } }>
                <Icon iconId="box" className="size-sm mr-2"/>
                <span class="pl-1 color-default">JetForms</span>
                <Icon iconId="chevron-right" className="col-ml-auto size-xs"/>
            </button>
            <div>
            <a onClick={ this.openManageMailSendSettingsDialog.bind(this) } class="with-icon">
                <Icon iconId="send" className="size-sm color-dimmed"/>
                <span class="color-dimmed">{ __('Send mail settings') }</span>
            </a>
            </div>
        </section>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    openManageMailSendSettingsDialog(e) {
        e.preventDefault();
        floatingDialog.open(MailSendSettingsManageDialog, {
            title: __('Send mail settings'),
        }, {
            floatingDialog,
        });
    }
}

export default EditAppMainPanelSection;
