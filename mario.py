# Frederik van Veen
# 10789324
# program prints two half-pyramids as used in super mario, of which the user can provide the height

import cs50


def main():
    # promts user until height in range [0,23] is given
    while True:
        pyramid_height = cs50.get_int("pyramid_height: ")
        if pyramid_height >= 0 and pyramid_height <= 23:
            break

    # print characters of pyramid per line
    for i in range(pyramid_height):

        # print spaces at left side of pyramid
        for a in range(pyramid_height - 1 - i):
            print(" ", end="")

        # print hashes of first half pyramid
        for b in range(i+1):
            print("#", end="")

        # print spaces between half pyramids
        print("  ", end="")

        # print hashes of second half pyramid
        for c in range(i+1):
            print("#", end="")

        # start new line
        print("")


if __name__ == "__main__":
    main()