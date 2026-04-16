module.exports = (sequelize, DataTypes) => {
  const HRApprovalRule = sequelize.define('HRApprovalRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ruleId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stage: {
      type: DataTypes.ENUM(
        'RESUME',
        'MCQ',
        'TECHNICAL',
        'INTERVIEW',
        'FINAL'
      ),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      comment: 'Job role this rule applies to (null = all roles)'
    },
    approvalsRequired: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Number of HR approvals needed'
    },
    approvalThreshold: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      comment: 'Fraction of approvals needed (e.g., 0.67 = 2 of 3)'
    },
    escalationThreshold: {
      type: DataTypes.FLOAT,
      defaultValue: 0.5,
      comment: 'If threshold not met, escalate'
    },
    slaHours: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      comment: 'Time limit for decision'
    },
    autoEscalateAfterDays: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      comment: 'Auto escalate if no decision'
    },
    requiresComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requiresMinimumConversation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'HR must have communication history'
    },
    minimumAIScoreForApproval: {
      type: DataTypes.FLOAT,
      comment: 'AI must meet this score for approval'
    },
    allowAutoReject: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Auto-reject if AI score below threshold'
    },
    notificationTemplate: DataTypes.STRING,
    escalationNotificationTemplate: DataTypes.STRING,
    createdBy: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' }
    },
    lastModifiedBy: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['stage', 'role'] },
      { fields: ['isActive'] }
    ]
  });

  HRApprovalRule.associate = (models) => {
    HRApprovalRule.belongsTo(models.User, { as: 'creator' });
    HRApprovalRule.belongsTo(models.User, { as: 'lastModifier' });
  };

  return HRApprovalRule;
};
