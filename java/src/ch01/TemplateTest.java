package ch01;

import java.io.ByteArrayInputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

/** Self-test for Template.FastReader and Template.solve (the template's own main reads stdin). */
public class TemplateTest {
    public static void main(String[] args) throws Exception { // @selftest
        // The book's example: tokens split by spaces and newlines read the same way.
        for (String input : new String[] {"123 456 monkey", "123 456\nmonkey\n", "  123\n\n 456   monkey"}) {
            Template.FastReader in = reader(input);
            check(in.nextInt() == 123 && in.nextInt() == 456 && "monkey".equals(in.next()), "tokens: " + input);
            check(in.next() == null, "null at end of input");
        }

        Template.FastReader in = reader("3\nhello world  here\n42\n");
        check(in.nextInt() == 3, "int before a line");
        check("hello world  here".equals(in.nextLine()), "nextLine keeps spaces");
        check(in.nextLong() == 42L, "long after a line");

        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        Template.solve(reader("4\n1000000000 1000000000\n1000000000 1000000000\n"), out);
        out.flush();
        check(sw.toString().trim().equals("4000000000"), "solve sums into a long: " + sw);
        System.out.println("TemplateTest OK");
    }

    static Template.FastReader reader(String s) {
        return new Template.FastReader(new ByteArrayInputStream(s.getBytes(StandardCharsets.UTF_8)));
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
