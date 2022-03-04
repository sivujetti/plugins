<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Envms\FluentPDO\Queries\Select;
use Pike\Db\{FluentDb, MyInsert};

final class ReactionsRepository {
    private const T = "\${p}QReactionsReactions";
    /** @var \Pike\FluentDb $db */
    private FluentDb $db;
    /**
     * @param \Pike\FluentDb $db
     */
    public function __construct(FluentDb $db) {
        $this->db = $db;
    }
    /**
     * @return \Pike\Db\MyInsert
     */
    public function insert(): MyInsert {
        return $this->db->insert(self::T);
    }
    /**
     * @return \Envms\FluentPDO\Queries\Select
     */
    public function select(): Select {
        return $this->db->select(self::T, 'stdClass');
    }
}
