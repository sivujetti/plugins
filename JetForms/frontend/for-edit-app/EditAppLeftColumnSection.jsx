import {__, floatingDialog, MenuSection, Icon} from '@sivujetti-commons-for-edit-app';
import MailSendSettingsManageDialog from './MailSendSettings/MailSendSettingsManageDialog.jsx';

class EditAppLeftColumnSection extends MenuSection {
    /**
     * @access protected
     */
    render() {
        return <MenuSection
            title="JetForms"
            subtitle={ __('Manage forms') }
            iconId="send"
            colorClass="color-purple">
            <nav>
                <a onClick={ this.openManageMailSendSettingsDialog.bind(this) } class="with-icon">
                    <Icon iconId="send" className="size-xs color-dimmed"/>
                    <span class="color-dimmed">{ __('Send mail settings') }</span>
                </a>
            </nav>
        </MenuSection>;
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

export default EditAppLeftColumnSection;
