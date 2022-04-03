<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Entities;

/**
 * @psalm-template DataShape
 */
final class DataBag {
    /** @var string */
    public string $bagName;
    /** @psalm-var DataShape */
    public array $data;
}
