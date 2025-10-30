<?php

namespace hal\dashwiz;

use yii\web\AssetBundle;

/**
 * Asset bundle
 * 
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class DashwizAsset extends AssetBundle
{
	public $css = [
        'dashwiz.widget.css',
    ];
	public $js = [
        'dashwiz.widget.js',
    ];
	public $depends = [
		'yii\bootstrap\BootstrapPluginAsset',
        'hal\dashwiz\HandlebarsAsset',
		'hal\dashwiz\BootstrapSweetalertAsset',
		'hal\dashwiz\SortableAsset'
	];
    
    public function init()
    {
        $this->sourcePath = __DIR__ . '/assets';
        parent::init();
    }
}
