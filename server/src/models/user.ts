import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  DataTypes,
  type Sequelize,
} from "sequelize";
import bcrypt from "bcrypt";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare email: string;
  // did not include the createdAt in here, sequelize will create that by itself since timestamps are set to true
  declare userRole: string; // admin, standard user, etc. for future use if time allows us.
  declare bio?: string;
  declare yarn: number;
  // Adding lastLogin to the user model
  declare lastLoginDate: string;
  // instance method to hash the password
  async setPassword(password: string) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(password, saltRounds);
  }
  // instance method to set the email to lower case
  async setEmailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}

export function UserFactory(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please enter a password",
          },
          // commenting this out for now, throwing errors on PUT requests
          // len: {
          //   args: [8, 25],
          //   msg: "Password must be at least 8 characters long",
          // },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      userRole: {
        type: DataTypes.STRING,
        defaultValue: "standard",
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      yarn: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
        validate: {
          isInt: true,
        },
      },
      lastLoginDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (user: User) => {
          await user.setPassword(user.password); // hash the password before it gets created on the table
          await user.setEmailToLowerCase(); // lower case the email before it gets created on the table
        },
        beforeUpdate: async (updatedUser: User) => {
          if (updatedUser.changed("password")) {
            // Only hash if the password field was modified. .changed is sequelize built in
            await updatedUser.setPassword(updatedUser.password);
          } else {
            console.log("Password not changed, no need to hash.");
          }
        },
      },
      sequelize,
      timestamps: true, // to enable timestamps of createdAt
      updatedAt: false, // but disable the updatedAt
      tableName: "users",
    }
  );
  return User;
}
