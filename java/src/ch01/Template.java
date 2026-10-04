package ch01;

// #region template
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.StringTokenizer;

public class Template {
    public static void main(String[] args) throws IOException {
        FastReader in = new FastReader(System.in);
        PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));
        solve(in, out);
        out.flush(); // nothing reaches the screen until you flush
    }

    static void solve(FastReader in, PrintWriter out) throws IOException {
        int n = in.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) sum += in.nextLong();
        out.println(sum);
    }

    // #region reader
    /** Whitespace-separated tokens, read line by line: many times faster than Scanner. */
    static class FastReader {
        private final BufferedReader br;
        private StringTokenizer st;

        FastReader(InputStream stream) {
            br = new BufferedReader(new InputStreamReader(stream), 1 << 16);
        }

        /** The next token, or null at the end of the input. */
        String next() throws IOException {
            while (st == null || !st.hasMoreTokens()) {
                String line = br.readLine();
                if (line == null) return null;
                st = new StringTokenizer(line);
            }
            return st.nextToken();
        }

        int nextInt() throws IOException { return Integer.parseInt(next()); }
        long nextLong() throws IOException { return Long.parseLong(next()); }
        double nextDouble() throws IOException { return Double.parseDouble(next()); }

        /** The rest of the current line is dropped; this returns the next whole line (spaces kept). */
        String nextLine() throws IOException {
            st = null;
            return br.readLine();
        }
    }
    // #endregion
}
// #endregion
