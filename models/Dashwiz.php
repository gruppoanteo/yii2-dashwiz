<?php

namespace anteo\dashwiz\models;

use yii\db\ActiveRecord;

/**
 * This is the model class for table "dashwiz".
 *
 * The followings are the available columns in table 'dashwiz':
 * @property string $layout
 * @property integer $user_id
 * @property string $settings
 * @property string $weight
 */
class Dashwiz extends ActiveRecord
{

    public static function tableName()
    {
        return '{{%dashwiz}}';
    }

    public function rules()
    {
        return [
            [['user_id', 'layout'], 'required'],
            ['layout', 'string', 'max' => 150],
            [['positions', 'settings'], 'safe'],
        ];
    }
    
    public function beforeSave($insert)
    {
        $this->settings = ($this->settings) ? serialize($this->settings) : null;
        $this->positions = ($this->positions) ? serialize($this->positions) : null;
        return parent::beforeSave($insert);
    }
    
    public function afterFind()
    {
        parent::afterFind();
        $this->settings = $this->settings ? unserialize($this->settings) : null;
        $this->positions = $this->positions ? unserialize($this->positions) : null;
    }
}
