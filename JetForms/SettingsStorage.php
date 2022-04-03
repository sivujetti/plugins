<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\Db\FluentDb;
use Pike\Interfaces\RowMapperInterface;
use SitePlugins\JetForms\Entities\DataBag;

class SettingsStorage {
    /** @var \Pike\Db\FluentDb */
    private FluentDb $db;
    /**
     * @param \Pike\Db\FluentDb $db
     */
    public function __construct(FluentDb $db) {
        $this->db = $db;
    }
    /**
     * @param string $name
     * @return ?\SitePlugins\JetForms\Entities\DataBag
     */
    public function getDataBag(string $name): ?DataBag {
        return $this->db->select("jetFormsSettings", DataBag::class)
            ->fields(["bagName", "data AS dataJson"])
            ->where("bagName = ?", [$name])
            ->mapWith(new class implements RowMapperInterface {
                public function mapRow(object $row, int $rowNum, array $rows): ?object {
                    $row->data = json_decode($row->dataJson, associative: true, flags: JSON_THROW_ON_ERROR);
                    return $row;
                }
            })
            ->fetch() ?? null;
    }
}
