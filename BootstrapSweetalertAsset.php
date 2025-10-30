<?php

namespace hal\dashwiz;

use yii\web\AssetBundle;

/**
 * Asset bundle
 * 
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class BootstrapSweetalertAsset extends AssetBundle
{
    public $sourcePath = '@bower/bootstrap-sweetalert/lib';
	public $css = [
        'sweet-alert.css',
    ];
	public $js = [
        'sweet-alert.min.js',
    ];
    public $depends = [
        'yii\bootstrap\BootstrapPluginAsset',
    ];
}
