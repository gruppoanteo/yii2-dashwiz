<?php

namespace anteo\dashwiz;

use yii\web\AssetBundle;

/**
 * Asset bundle
 * 
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class SortableAsset extends AssetBundle
{
    public $sourcePath = '@bower/jquery-ui';
	public $css = [
    ];
	public $js = [
        'ui/minified/data.js',
        'ui/minified/scroll-parent.js',
        'ui/minified/widget.js',
        'ui/widgets/mouse.js',
        'ui/widgets/sortable.js',
    ];
    public $depends = [
        'yii\web\JqueryAsset'
    ];
}
