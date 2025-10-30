<?php

namespace anteo\dashwiz;

use yii\web\AssetBundle;

/**
 * Asset bundle
 * 
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class HandlebarsAsset extends AssetBundle
{
    public $sourcePath = '@bower';
	public $js = [
        'mustache/mustache.min.js',
        'handlebars/handlebars.min.js',
    ];
}
