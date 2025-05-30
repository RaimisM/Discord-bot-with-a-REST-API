export default class Logger {
  static error(message: string): void {
    process.stderr.write(`\n[ERROR]: ${message}\n`)
  }

  static info(message: string): void {
    process.stdout.write(`\n[LOGGER INFO]: ${message}\n`)
  }
}
