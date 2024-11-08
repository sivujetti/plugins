interface ConfigureBehaviourPanelProps {
    behaviour: Behaviour;
    cssClass: string;
    onConfigurationChanged: (vals: {[propName: string]: any;}) => void;
    endEditMode: () => void;
    panelHeight: number;
    block: Block;
}

interface Behaviour {
    name: string; // Example 'SendMail' or 'ShowSentMessage'
    data: {[key: string]: any;};
}

interface BehaviourConfigurerImpl {
    configurerLabel: string; // Example: 'näytä käyttäjälle viesti'
    getButtonLabel: (data: {[key: string]: any;}) => string;
    configurerCls: preact.ComponentConstructor;
    isTerminator?: Boolean;
}

interface ContactFormBlockProps {
    behaviours: Array<Behaviour>;
    captcaToUse: string|null;
}

interface CreateInputSettings {
    name: string;
    friendlyName: string;
    type?: string;
    icon?: string;
    defaultPlaceholder?: string;
    inputMode?: string;
}
