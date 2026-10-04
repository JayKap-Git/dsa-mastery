package ch06;

import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Random;

/** §6.5 Huffman coding: repeatedly merge the two lightest trees; the result is an optimal prefix code. */
public class Huffman {

    // #region build
    static class Node {
        final long weight;
        final int id; // creation order, used to break ties
        final char ch; // leaf character (0 for internal nodes)
        final Node left, right;

        Node(long weight, int id, char ch, Node left, Node right) {
            this.weight = weight; this.id = id; this.ch = ch; this.left = left; this.right = right;
        }
    }

    static Node build(String s) {
        Map<Character, Integer> freq = new HashMap<>();
        for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);
        PriorityQueue<Node> pq = new PriorityQueue<>((a, b) -> a.weight != b.weight ? Long.compare(a.weight, b.weight) : Integer.compare(a.id, b.id));
        int id = 0;
        for (char c : s.toCharArray()) {
            if (freq.containsKey(c)) {
                pq.add(new Node(freq.remove(c), id++, c, null, null)); // @step leaf
            }
        }
        while (pq.size() > 1) {
            // the two lightest trees
            Node x = pq.poll(), y = pq.poll(); // @step pick
            // Heavier tree on the left (ties: older first), matching the book's codewords.
            Node l = x.weight == y.weight ? x : y, r = l == x ? y : x;
            pq.add(new Node(x.weight + y.weight, id++, (char) 0, l, r)); // @step merge
        }
        return pq.poll();
    }

    /** Left edge = 0, right edge = 1. */
    static void codes(Node v, String prefix, Map<Character, String> out) {
        if (v.left == null) {
            out.put(v.ch, prefix.isEmpty() ? "0" : prefix);
            return;
        }
        codes(v.left, prefix + "0", out);
        codes(v.right, prefix + "1", out);
    }
    // #endregion

    public static void main(String[] args) { // @selftest
        Map<Character, String> book = new HashMap<>();
        codes(build("AABACDACA"), "", book);
        check(book.equals(Map.of('A', "0", 'B', "110", 'C', "10", 'D', "111")), "book codewords: " + book);
        int bits = 0;
        for (char c : "AABACDACA".toCharArray()) bits += book.get(c).length();
        check(bits == 15, "book: 15 bits instead of 18");

        Random rnd = new Random(65);
        for (int it = 0; it < 300; it++) {
            StringBuilder sb = new StringBuilder();
            int len = 1 + rnd.nextInt(40);
            for (int i = 0; i < len; i++) sb.append((char) ('A' + rnd.nextInt(1 + rnd.nextInt(6))));
            String s = sb.toString();
            Map<Character, String> code = new HashMap<>();
            codes(build(s), "", code);
            for (String a : code.values())
                for (String b : code.values())
                    check(a.equals(b) || !b.startsWith(a), "prefix-free");
            StringBuilder enc = new StringBuilder();
            for (char c : s.toCharArray()) enc.append(code.get(c));
            Map<String, Character> back = new HashMap<>();
            code.forEach((k, v) -> back.put(v, k));
            StringBuilder dec = new StringBuilder(), cur = new StringBuilder();
            for (char bit : enc.toString().toCharArray()) {
                cur.append(bit);
                Character c = back.get(cur.toString());
                if (c != null) { dec.append(c); cur.setLength(0); }
            }
            check(dec.toString().equals(s), "decodes back to the input");
        }
        System.out.println("Huffman OK");
    }

    static void check(boolean ok, String what) {
        if (!ok) throw new AssertionError(what);
    }
}
