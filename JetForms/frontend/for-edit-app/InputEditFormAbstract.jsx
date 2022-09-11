import {api} from '@sivujetti-commons-for-edit-app';

class InputEditFormAbstract extends preact.Component {
    // showTechnicalInputs;
    constructor(props) {
        super(props);
        this.showTechnicalInputs = api.user.getRole() <= api.user.ROLE_ADMIN_EDITOR;
    }
}

export default InputEditFormAbstract;
