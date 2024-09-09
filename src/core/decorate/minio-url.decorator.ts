import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMinioUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string) {
    // 使用正则表达式来验证URL是否合法，允许更复杂的查询字符串
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

    return urlRegex.test(url);
  }

  defaultMessage() {
    return 'URL格式无效';
  }
}

export function IsMinioUrl(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMinioUrlConstraint,
    });
  };
}
