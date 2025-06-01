import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: any, args: ValidationArguments) {
    const object = args.object as any;
    return object.password === confirmPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'confirmPassword must match password';
  }
}
