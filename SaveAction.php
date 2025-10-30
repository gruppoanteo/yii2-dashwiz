<?php

namespace anteo\dashwiz;

use anteo\dashwiz\models\Dashwiz;
use Yii;
use yii\base\Action;
use yii\base\Exception;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\web\BadRequestHttpException;
use yii\web\Response;

/**
 * Action for save settings and positions for each widgets contained into \hal\dashwiz\DashwizGrid
 * 
 * use in Controller:
 * ```php
 * public function actions()
 * {
 *      return [
 *          'save' => '\anteo\dashwiz\SaveAction',
 *      ];
 * }
 * ```
 * 
 * @author Marco Curatitoli <marco.curatitoli@halservice.it>
 */
class SaveAction extends Action
{

    /**
     * Saves settings and positions to Database
     * Post attributes are
     * @param string $layout 
     * @param string $settings 
     * @param boolean $reset if true clear all settings
     */
    public function run()
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\base\InvalidConfigException('User must be logged in');
        }
        $layout = Yii::$app->request->post('layout');
        $settings = Yii::$app->request->post('settings');
        $reset = Yii::$app->request->post('reset', false);
        $redirect = Yii::$app->request->post('redirect', Url::home());

        if (!isset($layout)) {
            throw new BadRequestHttpException('layout is required');
        }

        if (!$reset) {
            Yii::$app->getResponse()->format = Response::FORMAT_JSON;
            $settings = Json::decode($settings);

            if ($this->saveSettings($layout, Yii::$app->user->id, $settings)) {
                return ['message' => 'Save Successfully'];
            } else {
                throw new Exception('Error while saving settings');
            }
        } else {
            $dashwiz = Yii::createObject(Dashwiz::class);
            $dashwiz::deleteAll([
                'layout' => $layout,
                'user_id' => Yii::$app->user->id,
            ]);
            Yii::$app->session->setFlash('success', Yii::t('dashwiz', "Widgets' settings are now restored to default values"));
            return $this->controller->redirect($redirect);
        }
    }

    /**
     * Save settings/positions to database
     * @param string $layout
     * @param integer $userId
     * @param string $settings
     * @return boolean
     */
    protected function saveSettings($layout, $userId, $settings)
    {
        assert(is_array($settings) && !empty($settings));

        try {
            $dashwiz = Yii::createObject(Dashwiz::class);
            $model = $dashwiz::findOne(['layout' => $layout, 'user_id' => $userId]);
            if ($model === null) {
                $model = Yii::createObject(Dashwiz::class);
                $model->layout = $layout;
                $model->user_id = $userId;
            }
            if (isset($settings['widget'])) {
                $model->settings = $settings;
            }
            if (isset($settings['grid'])) {
                $model->positions = $settings;
            }
            $model->save(false);
        } catch (\yii\db\Exception $e) {
            return false;
        }
        return true;
    }
}
