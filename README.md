# Coverage Checker

This script checks the code coverage of your project and compares it with the coverage of a specified branch.

# Prerequisites

To use this script, you need to have Node.js installed on your machine.

Installation
Clone the repository to your local machine.
Navigate to the project directory in your terminal.
Run npm install to install the dependencies.
Usage
The script can be run with one of the following command line options:

--check

Checks the code coverage of the current branch against the coverage of the dev branch. If the coverage of the current branch is lower than that of the dev branch, the script exits with an error.

## Example usage:

```bash
npm run coverage:check
```

Calculates the code coverage of the current branch and writes it to a JSON file.

## Example usage:

```bash
npm run coverage:write
```

Reads the code coverage data from the JSON file and displays it in a table.

## Example usage:

```bash
npm run coverage:read
```

Compares the code coverage of the current branch with that of the dev branch and displays the differences in a table.

## Example usage:

```bash
npm run coverage:diff
```

# Customization

The script is currently set up to check the coverage of the ui project in your repository. You can customize this by modifying the coverages array in the getCurrentBranchCoverage function.

You can also modify the allowed branches in which the code coverage data is written by modifying the allowed array in the writeDB function.

# License

This project is licensed under the MIT License.
