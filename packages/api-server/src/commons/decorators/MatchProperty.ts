import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchesProperty', async: false })
export class MatchesPropertyConstraint implements ValidatorConstraintInterface {
  public validate(value: string, { constraints, object }: ValidationArguments) {
    const [relatedPropertyName] = constraints;
    const relatedValue = object[relatedPropertyName];
    return typeof value === typeof relatedValue && value === relatedValue;
  }

  public defaultMessage({ constraints }: ValidationArguments) {
    const [relatedPropertyName] = constraints;
    return `Field $property must match ${relatedPropertyName}.`;
  }
}

export function MatchesProperty(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'matchesProperty',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: MatchesPropertyConstraint,
    });
  };
}
