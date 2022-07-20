import {__, Icon, floatingDialog, MenuSection} from '@sivujetti-commons-for-edit-app';
import MailSendSettingsManageDialog from './MailSendSettings/MailSendSettingsManageDialog.jsx';

class EditAppMainPanelSection extends MenuSection {
    /**
     * @access protected
     */
    render(_, {isCollapsed}) {
        return <section class={ `panel-section${isCollapsed ? '' : ' open'}` }>
            <button class="flex-centered pr-2 section-title col-12" onClick={ () => { this.setState({isCollapsed: !isCollapsed}); } }>
                <Icon iconId="box" className="p-absolute size-sm mr-2 color-purple"/>
                <span class="pl-1 d-block col-12 color-default">
                    JetForms
                    <span class="text-ellipsis text-tiny col-12">{ __('Manage forms') }</span>
                </span>
                <Icon iconId="chevron-right" className="p-absolute size-xs"/>
            </button>
            <div>
            <a onClick={ this.openManageMailSendSettingsDialog.bind(this) } class="with-icon">
                <Icon iconId="send" className="size-xs color-dimmed"/>
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
