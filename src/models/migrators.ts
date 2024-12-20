import mongoose from 'mongoose';
interface IMigrateRename {
  collectionName: string;
  oldFieldName: string;
  newFieldName: string;
}
export const migrateRename = async ({collectionName, oldFieldName, newFieldName}:IMigrateRename) => {

  const result = await mongoose.connection.db.collection(collectionName).updateMany(
    { [oldFieldName]: { $exists: true } }, 
    { $rename: { [oldFieldName]: newFieldName } }
  );

  console.log(`Field '${oldFieldName}' renamed to '${newFieldName}' in '${collectionName}' collection for ${result.modifiedCount} documents.`);
};

interface IMigrateDelete {
  collectionName: string;
  fieldName: string;
}

export const migrateDelete = async ({ collectionName, fieldName }: IMigrateDelete) => {
    const result = await mongoose.connection.db.collection(collectionName).updateMany(
      { [fieldName]: { $exists: true } }, 
      { $unset: { [fieldName]: "" } }
    );
    console.log(
      `Field '${fieldName}' removed from '${collectionName}' collection for ${result.modifiedCount} documents.`
    );
};