<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

/**
 * Validates and runs a JetForms behaviour {type: string, data: object} stored
 * to a Contact|SubscriptionForm blocks' behaviours field.
 *
 * @psalm-type InputMeta = array{type: string, name: string, label: string, isRequired: bool, details: array{options: array<int, array{text: string, value: string}>, multiple: bool}|array<string, mixed>}
 */
interface BehaviourExecutorInterface {
    /**
     * @param object $behaviourData Valid data from the database (behaviour.data)
     * @param object $reqBody Non-validated data from the form (plugins/JetForms/templates/block-some-form.tmpl.php)
     * @param array<int, InputMeta> $inputsMeta Details of input form inputs
     */
    public function run(object $behaviourData, object $reqBody, array $inputsMeta): void;
}
