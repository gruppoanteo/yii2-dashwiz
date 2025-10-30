<?php

namespace hal\dashwiz;

use hal\dashwiz\models\Dashwiz;
use Yii;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;

/**
 * DashwizWidget grid.
 * 
 * It is important to set widgets ids if you want to save settings and positions to database.
 * 
 * Usage:
 * ```html
 * <?php
 * use hal\dashwiz\DashwizGrid;
 * use hal\dashwiz\DashwizWidget;
 * ?>
 * 
 * <?php DashwizGrid::begin() ?>
 * <div class="row">
 *    <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
 *       <?php DashwizWidget::begin(['id' => 'widget1', 'title' => 'Title 1']) ?>
 *          widget content 1
 *       <?php DashwizWidget::end() ?>
 *
 *       <?php DashwizWidget::begin(['id' => 'widget2', 'title' => 'Title 2']) ?>
 *          widget content 2
 *       <?php DashwizWidget::end() ?>
 *    </article>
 *    <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
 *       <?php DashwizWidget::begin(['id' => 'widget3', 'title' => 'Title 3']) ?>
 *          widget content 3
 *       <?php DashwizWidget::end() ?>
 * 
 *       <?php DashwizWidget::begin(['id' => 'widget4', 'title' => 'Title 4']) ?>
 *          widget content 4
 *        <?php DashwizWidget::end() ?>
 *    </article>
 * </div>
 * <?php DashwizGrid::end() ?>
 * ```
 * To reset saved settings fire event $('#widget-grid').trigger('reset.jw');
 * 
 * If you set saveUrl attribute with a route, you can save settings to Database by calling SaveAction.
 * (see registerScript function).
 * It can be attached to controller:
 * ```php
 * use hal\dashwiz\SaveAction;
 * 
 * public function actions()
 * {
 *     return [
 *         'save' => [
 *             'class' => SaveAction::className(),
 *         ],
 *     ];
 * }
 * ```
 *  
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class DashwizGrid extends \yii\base\Widget
{
    /**
     * @var boolean model interaction
     */
    public $useModel = true;
    /**
     * @var mixed array for js options (see dashwiz.widget.js), false for defaults.
     *    'sortable' => true,
     *    'titleContainer' => 'h2',
     *    'collapseIcon' => ['zmdi zmdi-minus', 'zmdi zmdi-plus'],
     *    'fullscreenIcon' => ['zmdi zmdi-arrow-right-top', 'zmdi zmdi-arrow-left-bottom'],
     *    'ctrlsSelector' => '.actions',
     *    'deleteIcon' => 'zmdi zmdi-close',
     *    'dragHandle' => '> .card-header'
     *    'togglerContainer' => '#dashboard-toggle',
     *    'controlsClass' => 'actions',
     *    'controlsTag' => 'ul',
     *    'controlContainer' => 'li',
     *    'controlButtonClass' => '',
     */
    public $clientOptions = false;
    /**
     * @var mixed array for handling js events. false for none.
     * Events are: save.jw, reset.jw, fullScreen.jw, afterLoad.jw, delete.jw, change.jw
     * if saveUrl is set, save.jw and reset.jw are auto implemented.
     * example:
     * ```php
     * $this->clientEvents = ['save.jw' => "function(ev, settings) {
     *      alert('save');
     * }]";
     * ```
     */
    public $clientEvents = false;
    /**
     * @var string layout. Default to Yii::$app->controller->route
     */
    public $layout;
    /**
     * @var array route to save action
     */
    public $saveUrl = false;
    /**
     * @var string tag for grid container
     */
    public $tag = 'section';
    /**
     * @var string tag for column container 
     */
    public $columnTag = 'article';
    /**
     * @var mixed set string for jQuery element toggler (which is an unordered list) container, false for no toggler
     * if false, close button on a widgets removes widgets from the page, and you must clear settings to bring it back.
     * if not false, a list with all widgets on the page will be renderer into the element specified. Close button on a widget
     * simply hides it. In this way all activities (ajax calls for example) in widget still run even if it isn't visible.
     */
    public $togglerContainer = false;
    /**
     * @var toggler template. see @http://handlebarsjs.com/
     */
    public $togglerTemplate = '<div class="btn-group"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Widgets <span class="caret"></span></button><ul class="dropdown-menu">{{#portlets}}<li class="{{disabled}}"><a href="#" data-dashwiz-widget-id="{{widgetId}}">{{label}}</a></li>{{/portlets}}</ul></div></div>';
//    public $togglerTemplate = '<ul class="list-inline">{{#portlets}}<li><a class="btn btn-link {{disabled}}" data-dashwiz-widget-id="{{widgetId}}">{{label}}</a></li>{{/portlets}}</ul>';
    /**
     * @var toggler main element selector
     */
    public $togglerElement = 'button';
    /**
     * @var toggler hide if widget visible
     */
    public $togglerHideOnHidden = false;
    /**
     * @var array the HTML attributes (name-value pairs) for the form tag.
     * @see Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $options = [];
    /**
     * @var string message to confirm widget remove 
     */
    public $deleteMessage;
    /**
     * @var array|boolean tooltip options for widgets controls, false to disable tooltips
     */
    public $controlsTooltip = false;

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
//        $this->initTranslations();
        $this->initOptions();
        echo Html::beginTag($this->tag, $this->options) . "\n";
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        parent::run();
        echo Html::endTag($this->tag) . "\n";
        $this->registerScript();
    }

    /**
     * Inits options
     */
    protected function initOptions()
    {
        if (!isset($this->options['id'])) {
            $this->options['id'] = $this->getId();
        }
        
        if ($this->layout === null) {
            $this->layout = Yii::$app->controller->route;
        }
        
        if ($this->deleteMessage == '') {
            $this->deleteMessage = Yii::t('dashwiz', 'Are you sure you want to remove this widget?');
        }

        if ($this->useModel) {
            $dashwiz = Yii::createObject(Dashwiz::class);
            $model = $dashwiz->findOne([
                'user_id' => Yii::$app->user->id,
                'layout' => $this->layout
            ]);

            if ($model !== null) {
                $this->clientOptions['defaultSettings'] = $model->settings;
                $this->clientOptions['defaultPositions'] = $model->positions;
            }
        }

        $this->clientOptions['grid'] = $this->columnTag;
        $collapseIcons = ArrayHelper::getValue($this->clientOptions, 'collapseIcons');
        if (isset($collapseIcons) && is_array($collapseIcons)) {
            $this->clientOptions['collapseIcons'] = implode("|", $collapseIcons);
        }
        $fullscreenIcons = ArrayHelper::getValue($this->clientOptions, 'fullscreenIcons');
        if (isset($fullscreenIcons) && is_array($fullscreenIcons)) {
            $this->clientOptions['fullscreenIcons'] = implode("|", $fullscreenIcons);
        }
        $this->clientOptions['togglerContainer'] = $this->togglerContainer;
        $this->clientOptions['togglerTemplate'] = $this->togglerTemplate;
        $this->clientOptions['togglerElement'] = $this->togglerElement;
        $this->clientOptions['togglerHideOnHidden'] = $this->togglerHideOnHidden;
        $this->clientOptions['deleteMessage'] = $this->deleteMessage;
    }
    
//    protected function initTranslations()
//    {
//        if (empty(Yii::$app->i18n->translations['dashwiz'])) {
//            Yii::setAlias("@dashwiz", __DIR__);
//            Yii::$app->i18n->translations['dashwiz*'] = [
//                'class' => 'yii\i18n\PhpMessageSource',
//                'basePath' => "@dashwiz/messages",
//                'forceTranslation' => true
//            ];
//        }
//    }

    /**
     * Registers assets
     */
    protected function registerScript()
    {
        $view = $this->getView();
        DashwizAsset::register($view);

        $options = '';
        if ($this->clientOptions !== false) {
            if (isset($this->clientOptions['defaultSettings'])) {
                $this->clientOptions['defaultSettings'] = Json::encode($this->clientOptions['defaultSettings']);
            }
            if (isset($this->clientOptions['defaultPositions'])) {
                $this->clientOptions['defaultPositions'] = Json::encode($this->clientOptions['defaultPositions']);
            }
            $options = empty($this->clientOptions) ? '' : Json::encode($this->clientOptions);
        }
        $js[] = "$('#{$this->id}').dashwiz($options);";
        
        if ($this->controlsTooltip !== false) {
            $tooltipOptions = Json::encode((array)$this->controlsTooltip);
            $js[] = "$('#{$this->id} .dashwiz-controls button').tooltip({$tooltipOptions});";
        }
        $view->registerJs(implode("\n", $js));

        if ($this->saveUrl !== false && !isset($this->clientOptions['save.jw'])) {
            $url = Url::to($this->saveUrl);
            $this->clientEvents['dashwiz:save'] = "function(ev, settings) {
                var layout = '" . $this->layout . "';
                $.post('$url', {layout: layout, settings: settings});
            }";

            $this->clientEvents['dashwiz:reset'] = "function(ev) {
                var layout = '" . $this->layout . "';
                $.post('$url', {layout: layout, settings: null, reset: true}, function() {
                    location.reload();
                });
            }";
        }
        if (!empty($this->clientEvents)) {
            $ev = [];
            foreach ($this->clientEvents as $event => $handler) {
                $ev[] = "jQuery('#{$this->id}').on('$event', $handler);";
            }
            $view->registerJs(implode("\n", $ev));
        }
    }
}
