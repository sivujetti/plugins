<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Pike\Response;

final class MainController {
    /**
     * GET /plugins/jet-icons/icons-pack-icons/default: ...
     *
     * @param \Pike\Response $res
     * @param \SitePlugins\JetIcons\TablerIconPack $icons
     */
    public function getIconPackIcons(Response $res, TablerIconPack $icons): void {
        $asList = [];
        foreach ($icons->getAll() as $iconId => $svg)
            $asList[] = ["iconId" => $iconId, "inlineSvgShapes" => $svg];
        $res->json(["icons" => $asList]);
    }
}
