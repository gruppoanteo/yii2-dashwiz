<?php

namespace anteo\dashwiz;

use Yii;
use yii\base\Widget;
use yii\bootstrap\Html;
use yii\helpers\ArrayHelper;

/**
 * DashwizWidget widgets.
 *  
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class DashwizWidget extends Widget
{
    /**
     * @var string widget title
     */
    public $title;
    /**
     * @var string widget subtitle
     */
    public $subtitle;
    /**
     * @var string template for header content 
     */
    public $headerTemplate = "{controls}<h3 class=\"dashwiz-title panel-title\">{title} <small>{subtitle}</small></h3>";
    /**
     * @var array the HTML attributes (name-value pairs) for widget.
     * @see Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $options = [];
    /**
     * @var array the HTML attributes (name-value pairs) for header.
     * @see Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $headerOptions = [];
      /**
     * @var array the HTML attributes (name-value pairs) for footer.
     * @see Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $footerOptions = [];
    /**
     * @var array the HTML attributes (name-value pairs) for body.
     * @see Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $bodyOptions = [];
    /**
     * @var string body content 
     */
//    public $body;
    /**
     * @var boolean
     */
    public $renderBody = true;
    
    public $content;
    /**
     * @var string header controls
     */
    public $controls;
    /**
     * @var
     */
    public $controlOptions = [];
    
    public $collapse = true;
    
    public $delete = true;
    
    public $fullscreen = true;
    
    public $clientEvents = [];
    
    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();

        $this->initOptions();
        
        $this->registerAssets();
        
        $this->registerClientEvents();

        echo Html::beginTag('div', $this->options) . "\n";
        echo $this->renderHeader() . "\n";
        if ($this->renderBody) {
            echo $this->renderBodyBegin() . "\n";
        }
    }
    
    /**
     * Renders widget header
     * @return string
     */
    protected function renderHeader()
    {
        $subtitle = ($this->subtitle != "") ? $this->subtitle : '';
        $controls = [];
        $itemOptions = ArrayHelper::remove($this->controlOptions, 'itemOptions', []);
        Html::addCssClass($itemOptions, ['widget' => 'btn btn-sm']);
        Html::addCssClass($this->controlOptions, ['widget' => 'pull-right']);
        
        if ($this->collapse) {
            $options = $itemOptions;
            $options['data-dashwiz-action'] = "collapse";
            $options['title'] = Yii::t('dashwiz', 'Toggle');
            $controls[] = Html::button(Html::icon('minus'), $options);
        }
        if ($this->fullscreen) {
            $options = $itemOptions;
            $options['data-dashwiz-action'] = "fullscreen";
            $options['title'] = Yii::t('dashwiz', 'Fullscreen');
            $controls[] = Html::button(Html::icon('resize-full'), $options);
        }
        if ($this->delete) {
            $options = $itemOptions;
            $options['data-dashwiz-action'] = "delete";
            $options['title'] = Yii::t('dashwiz', 'Remove');
            $controls[] = Html::button(Html::icon('remove'), $options);
        }
        if ($this->controls) {
            array_unshift($controls, $this->controls);
        }
        
        if (!empty($controls)) {
            $tag = ArrayHelper::remove($this->controlOptions, 'tag', 'div');
            $controls = Html::tag($tag, implode("\n", $controls), $this->controlOptions);
        } else {
            $controls = '';
        }
        
        if (!isset($this->title, $subtitle) && !empty($controls)) {
            return;
        }

        $header = strtr($this->headerTemplate, [
            '{title}' => $this->title,
            '{subtitle}' => $subtitle,
            '{controls}' => $controls
        ]);

        return Html::tag('div', $header, $this->headerOptions);
    }

    /**
     * Starts widget body
     * @return string
     */
    protected function renderBodyBegin()
    {
        echo Html::beginTag('div', $this->bodyOptions) . "\n"; 
    }

    /**
     * Renders widget body end
     * @return string
     */
    protected function renderBodyEnd()
    {
        return Html::endTag('div');
    }
    
    protected function renderBodyContent()
    {
        if ($this->content) {
            echo $this->content;
        }
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        parent::run();
        echo $this->renderBodyContent() . "\n";
        if ($this->renderBody) {
            echo $this->renderBodyEnd() . "\n";
        }
        echo Html::endTag('div') . "\n"; // widget
    }
    
    public function renderFooterBegin()
    {
        return Html::beginTag('div', $this->footerOptions) . "\n";
    }
    
    public function renderFooterEnd()
    {
        return Html::endTag('div') . "\n";
    }

    /**
     * Initializes options
     */
    protected function initOptions()
    {
        if (!isset($this->options['id'])) {
            $this->options['id'] = $this->getId();
        }
        Html::addCssClass($this->options, ['widget' => 'panel', 'dashwiz']);
        Html::addCssClass($this->headerOptions, ['widget' => 'panel-heading', 'dashwiz-header']);
        Html::addCssClass($this->bodyOptions, ['widget' => 'panel-body', 'dashwiz-body']);
        Html::addCssClass($this->footerOptions, ['widget' => 'panel-footer']);
        Html::addCssClass($this->controlOptions, 'dashwiz-controls');
    }
    
    protected function registerAssets()
    {
        DashwizAsset::register($this->getView());
    }
    
    protected function registerClientEvents()
    {
        if (!empty($this->clientEvents)) {
            $id = $this->options['id'];
            $js = [];
            foreach ($this->clientEvents as $event => $handler) {
                $js[] = "jQuery('#$id').on('$event', $handler);";
            }
            $this->getView()->registerJs(implode("\n", $js));
        }
    }
}
