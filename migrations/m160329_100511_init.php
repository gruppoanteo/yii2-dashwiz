<?php

use yii\db\Schema;

class m160329_100511_init extends \yii\db\Migration
{
	public function safeUp()
	{
		$tableOptions = null;
		if ($this->db->driverName === 'mysql') {
			$tableOptions = 'CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=InnoDB';
		}

		$this->createTable('{{%dashwiz}}', [
			'layout' => $this->string(150)->notNull(),
			'user_id' => $this->integer()->notNull(),
			'settings' => $this->text(),
			'positions' => $this->text(),
		], $tableOptions);
		
		$this->addPrimaryKey('{{%dashwiz_pkey}}', '{{%dashwiz}}', [
			'layout',
			'user_id',
		]);
	}

	public function down()
	{
		$this->dropTable('{{%dashwiz}}');
	}
}