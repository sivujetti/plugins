<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

final class TablerIconPack {
    /** @var array<string, string> */
    private static array $cached;
    /**
     * @return array<string, string>
     */
    public function getAll(): array {
        if (!isset(self::$cached))
            self::$cached = include __DIR__ . "/tabler-paths.php";
        return self::$cached;
    }
    /**
     * @param string $iconId
     * @param string $default = ""
     * @return string
     */
    public function getSingle(string $iconId, string $default = ""): string {
        return $this->getAll()[$iconId] ?? $default;
    }
}
