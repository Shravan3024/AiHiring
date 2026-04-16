module.exports = (sequelize, DataTypes) => {
  const ApprovalRecord = sequelize.define('ApprovalRecord', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    approvalId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Applications', key: 'id' }
    },
    hrUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    approvalStage: {
      type: DataTypes.ENUM(
        'RESUME_REVIEW',
        'TECHNICAL_REVIEW',
        'INTERVIEW_REVIEW',
        'FINAL_DECISION'
      ),
      allowNull: false
    },
    decision: {
      type: DataTypes.ENUM(
        'APPROVED',
        'REJECTED',
        'ON_HOLD',
        'REQUEST_RE_INTERVIEW',
        'PENDING'
      ),
      defaultValue: 'PENDING'
    },
    reason: DataTypes.TEXT,
    comments: DataTypes.TEXT,
    recommendedAction: {
      type: DataTypes.ENUM('PROCEED', 'REJECT', 'ESCALATE'),
      defaultValue: 'PROCEED'
    },
    aiRecommendation: {
      type: DataTypes.ENUM('STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO')
    },
    approvalOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Order in multi-HR approval workflow'
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'ESCALATED',
        'LOCKED'
      ),
      defaultValue: 'PENDING'
    },
    reviewedAt: DataTypes.DATE,
    approvedAt: DataTypes.DATE,
    approvalThresholdMet: {
      type: DataTypes.BOOLEAN,
      comment: 'Did this approval meet the configured threshold?'
    },
    totalApprovalsNeeded: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    approvalsReceived: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    conflictingApprovals: {
      type: DataTypes.JSON,
      comment: 'Array of conflicting approval records'
    },
    escalationReason: DataTypes.TEXT,
    escalatedTo: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' }
    },
    auditTrail: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of {action, timestamp, actor, details}'
    },
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING
  }, {
    timestamps: true,
    indexes: [
      { fields: ['applicationId', 'approvalStage'] },
      { fields: ['hrUserId', 'status'] },
      { fields: ['status'] }
    ]
  });

  ApprovalRecord.associate = (models) => {
    ApprovalRecord.belongsTo(models.Application);
    ApprovalRecord.belongsTo(models.User, { as: 'reviewer' });
    ApprovalRecord.belongsTo(models.User, { as: 'escalatedUser', foreignKey: 'escalatedTo' });
  };

  return ApprovalRecord;
};
