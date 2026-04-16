module.exports = (sequelize, DataTypes) => {
  const EvaluationProsCons = sequelize.define('EvaluationProsCons', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Applications', key: 'id' }
    },
    evaluationStage: {
      type: DataTypes.ENUM(
        'RESUME',
        'TECHNICAL_ASSESSMENT',
        'INTERVIEW',
        'AGGREGATED'
      ),
      allowNull: false
    },
    pros: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of {point, source, severity, score}'
    },
    cons: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of {point, source, severity, score}'
    },
    overallScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Weighted score for this stage (0-100)'
    },
    sourceData: {
      type: DataTypes.JSON,
      comment: 'Raw data used for generating pros/cons'
    },
    generatedBy: DataTypes.STRING, // AI model version or HR ID
    generatedAt: DataTypes.DATE,
    lastModifiedBy: DataTypes.STRING,
    lastModifiedAt: DataTypes.DATE,
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['applicationId', 'evaluationStage'] },
      { fields: ['evaluationStage'] }
    ]
  });

  EvaluationProsCons.associate = (models) => {
    EvaluationProsCons.belongsTo(models.Application);
  };

  return EvaluationProsCons;
};
